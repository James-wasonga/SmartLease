"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, Loader, X } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { CurrencySelect, Currency } from "@/components/ui/currency-select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import {
  NFTMetadata,
  uploadMetadata,
  uploadToIPFS,
} from "@/services/pinata/pinata";
import { useWaitForTransaction } from "wagmi";
import {
  PaymentType,
  useCreateProperty,
} from "@/services/request/contract/contract-request";
import { getParsedError } from "@/utils/scaffold-eth";
import { formatDurationFromMonths, priceFormatter } from "@/utils/formatter";
import { Routes } from "@/app/routes";
import PropertyImage from "@/components/shared/PropertyImage";

const formSchema = z.object({
  files: z
    .array(z.custom<File>())
    .min(1, "Please select at least one file")
    .max(1, "You can upload only a single file")
    .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), {
      message: "File size must be less than 5MB",
      path: ["files"],
    }),
  propertY_name: z.string({ required_error: "Property name is required" }),
  propertY_address: z.string({ required_error: "Property address is required" }),
  city: z.string({ required_error: "City is required" }),
  state: z.string({ required_error: "State is required" }),
  zip_code: z.string({ required_error: "Please provide a valid zipcode" }),
  price: z.number().min(1, { message: "Price is required" }),
  duration: z.number().min(1, { message: "Duration is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  flexible_payment: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;
type UploadStatus = "idle" | "uploading" | "minting" | "success" | "error";

const LandlordCreate = () => {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
      flexible_payment: false,
    },
  });

  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { writeAsync: createProperty } = useCreateProperty();

  const showPreview = async () => {
    const valid = await form.trigger();
    if (valid) {
      setPreviewOpen(true);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setStatus("uploading");
    setUploadProgress("Uploading image to IPFS...");

    try {
      // 1. Upload image to IPFS
      const imageUrl = await uploadToIPFS(data.files[0]);
      console.log("Image URL stored on-chain:", imageUrl);

      setUploadProgress("Uploading metadata to IPFS...");

      // 2. Create and upload metadata
      const metadata: NFTMetadata = {
        name: data.propertY_name,
        image: imageUrl,
      };

      await uploadMetadata(metadata, {
        city: data.city,
        currency: data.currency,
        duration: data.duration,
        flexible_payment: data.flexible_payment,
        price: data.price,
        propertY_address: data.propertY_address,
        propertY_name: data.propertY_name,
        state: data.state,
        zip_code: data.zip_code,
      });

      setUploadProgress("Sending transaction...");
      setStatus("minting");

      // 3. Call contract
      await createPropertyFn({
        city: data.city,
        currency: data.currency,
        duration: data.duration,
        propertyAddr: data.propertY_address,
        name: data.propertY_name,
        state: data.state,
        zipCode: data.zip_code,
        paymentType: data.flexible_payment
          ? PaymentType.Flexible
          : PaymentType.Fixed,
        image: imageUrl,
        value: data.price,
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Transaction failed"
      );
      setStatus("error");
    }
  };

  const createPropertyFn = async ({
    city,
    currency,
    duration,
    image,
    name,
    paymentType,
    propertyAddr,
    state,
    value,
    zipCode,
  }: {
    value: number;
    duration: number;
    paymentType: PaymentType;
    name: string;
    image: string;
    propertyAddr: string;
    city: string;
    state: string;
    zipCode: string;
    currency: string;
  }) => {
    try {
      const tx = await createProperty({
        args: [
          value,
          duration,
          paymentType,
          name,
          image,
          propertyAddr,
          city,
          state,
          zipCode,
          currency,
        ],
      });
      setTxHash(tx.hash);
    } catch (err) {
      const error = getParsedError(err);
      toast.error(error);
      setStatus("error");
    }
  };

  useWaitForTransaction({
    hash: txHash,
    confirmations: 1,
    enabled: !!txHash,
    onSuccess() {
      setStatus("success");
      toast.success("Property created successfully! Redirecting...");
      form.reset();
      setPreviewOpen(false);
      setPreviewUrl(null);
      setTxHash(undefined);
      // Wait 2s so the RPC node has time to index the event before the
      // properties page tries to fetch it
      setTimeout(() => {
        router.push(Routes.LANDLORD_PROPERTIES);
      }, 2000);
    },
    onError(error) {
      console.error("Transaction failed to confirm:", error);
      toast.error("Transaction failed to confirm on chain");
      setStatus("error");
    },
  });

  const calculateEquity = () => {
    const price = form.getValues("price");
    const duration = form.getValues("duration");
    if (!price || !duration) return 0;
    const monthlyRent = price / duration;
    return (monthlyRent / price) * 100;
  };

  const isSubmitting = status === "uploading" || status === "minting";

  return (
    <main className="bg-gray-100 pb-16">
      <div className="content-container bg-white mt-16 py-10 rounded-lg">
        <p className="text-slate-700 font-semibold text-xl mb-5">
          Create Property
        </p>
        <Form {...form}>
          <form className="w-full flex flex-col gap-y-5">
            {/* Property Image Upload */}
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Property Image</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value}
                      onValueChange={(e) => {
                        field.onChange(e);
                        if (e[0]) {
                          setPreviewUrl(URL.createObjectURL(e[0]));
                        } else {
                          setPreviewUrl(null);
                        }
                      }}
                      accept="image/*"
                      maxFiles={1}
                      maxSize={5 * 1024 * 1024}
                      onFileReject={(_, message) => {
                        form.setError("files", { message });
                      }}
                    >
                      <FileUploadDropzone className="flex-row flex-wrap border-dotted text-center bg-gray-100 py-16">
                        <CloudUpload className="size-4" />
                        Drag and drop or
                        <FileUploadTrigger asChild>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0"
                            type="button"
                          >
                            choose files
                          </Button>
                        </FileUploadTrigger>
                        to upload
                      </FileUploadDropzone>
                      <FileUploadList>
                        {field.value.map((file, index) => (
                          <FileUploadItem key={index} value={file}>
                            <FileUploadItemPreview />
                            <FileUploadItemMetadata />
                            <FileUploadItemDelete asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                type="button"
                              >
                                <X />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </FileUploadItemDelete>
                          </FileUploadItem>
                        ))}
                      </FileUploadList>
                    </FileUpload>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property Name & Address */}
            <div className="flex items-start gap-x-6">
              <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="propertY_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Name</FormLabel>
                      <FormControl>
                        <Input
                          className="py-6"
                          placeholder="Owl City"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="propertY_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Address</FormLabel>
                      <FormControl>
                        <Input
                          className="py-6"
                          placeholder="No 21 Wall Street"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* City, State, Zip */}
            <div className="flex items-start gap-x-6">
              <div className="w-1/3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          className="py-6"
                          placeholder="Harlem"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-1/3">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          className="py-6"
                          placeholder="Kansas"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-1/3">
                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input
                          className="py-6"
                          placeholder="10001"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Price & Duration */}
            <div className="flex items-start gap-x-6">
              <div className="w-1/2 space-y-2">
                <FormLabel
                  className={cn(
                    (form.formState.errors.currency ||
                      form.formState.errors.price) &&
                      "text-destructive"
                  )}
                >
                  Property Value
                </FormLabel>

                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormControl>
                        <CurrencySelect
                          onValueChange={field.onChange}
                          onCurrencySelect={(currency) => {
                            setSelectedCurrency(currency);
                          }}
                          placeholder="Currency"
                          disabled={false}
                          currencies="all"
                          variant="small"
                          {...field}
                        />
                      </FormControl>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <div className="relative w-full">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            disabled={!selectedCurrency}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="pr-10 py-6"
                          />
                        </FormControl>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                          {selectedCurrency?.symbol}
                        </span>
                      </div>
                    )}
                  />
                </div>

                {(form.formState.errors.currency ||
                  form.formState.errors.price) && (
                  <div className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.currency?.message && (
                      <p>{form.formState.errors.currency.message}</p>
                    )}
                    {form.formState.errors.price?.message && (
                      <p>{form.formState.errors.price.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="py-6"
                          type="number"
                          placeholder="12"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>All values are in months</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Flexible Payment Toggle */}
            <div className="">
              <FormField
                control={form.control}
                name="flexible_payment"
                render={({ field }) => (
                  <FormItem className="">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                        id="enable-flexible-payment"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="enable-flexible-payment"
                      className="pl-3"
                    >
                      Accept flexible payment
                    </FormLabel>
                    <FormDescription className="block">
                      This allows the tenant to pay rent in a lump sum as well
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <Button
              onClick={() => showPreview()}
              type="button"
              className="mt-4 py-6"
            >
              Preview
            </Button>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger className="hidden">Open</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Property Preview</DialogTitle>

                  {/* ✅ Use PropertyImage in the preview so you see exactly
                      what will appear on the properties page */}
                  {previewUrl ? (
                    <PropertyImage
                      src={previewUrl}
                      alt="Property preview"
                      className="h-56 w-full object-cover object-center pt-2 rounded-md"
                    />
                  ) : (
                    <div className="h-56 w-full bg-gray-100 flex items-center justify-center rounded-md">
                      <span className="text-gray-400">No image selected</span>
                    </div>
                  )}
                </DialogHeader>

                <div className="flex flex-col gap-2 text-gray-600 text-sm">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">
                      {form.getValues("propertY_name")}
                    </p>
                    <Badge className="p-1 bg-gray-100 rounded-full w-max text-slate-600 text-base font-semibold">
                      Token #100
                    </Badge>
                  </div>

                  <p className="text-sm capitalize">
                    {form.getValues("propertY_address")}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <p>Monthly Rent:</p>
                    <p className="text-lg">
                      {form.getValues("currency")}{" "}
                      {priceFormatter(
                        form.getValues("price") / form.getValues("duration"),
                        4
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p>Property Value:</p>
                    <p className="text-lg">
                      {form.getValues("currency")}{" "}
                      {priceFormatter(form.getValues("price"), 4)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p>Equity ratio:</p>
                    <p className="text-base">{calculateEquity()}% monthly</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p>Estimated ownership transfer period:</p>
                    <p className="text-base font-medium">
                      {formatDurationFromMonths(form.getValues("duration"))}
                    </p>
                  </div>
                </div>

                {form.getValues("flexible_payment") && (
                  <div className="text-sm text-green-600">
                    Since flexible payment is allowed, payment can be completed
                    in less than the specified duration.
                  </div>
                )}

                <div className="mt-3">
                  <Alert className="border-blue-600/50 text-blue-600 bg-blue-400/20 dark:border-blue-600 [&>svg]:text-blue-600">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle className="pb-2">
                      Important Information
                    </AlertTitle>
                    <AlertDescription>
                      You will receive 100 tokens representing full ownership of
                      this property. Equity is calculated based on your set
                      duration and monthly payment.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="">
                  {uploadProgress && (
                    <div className="text-sm text-muted-foreground mb-2">
                      {uploadProgress}
                    </div>
                  )}

                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    type="submit"
                    disabled={isSubmitting}
                    className="py-6 rounded-md font-medium w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        {status === "uploading"
                          ? "Uploading to IPFS..."
                          : "Creating Property on Chain..."}
                      </>
                    ) : (
                      "Create Property"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default LandlordCreate;