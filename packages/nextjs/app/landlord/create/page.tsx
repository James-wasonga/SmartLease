"use client";
 
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, Loader, X } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
 
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { CurrencySelect, Currency } from "@/components/ui/currency-select";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { NFTMetadata, uploadMetadata, uploadToIPFS } from "@/services/pinata/pinata";
import { useContractWrite, useWaitForTransaction } from "wagmi";
import { RentToOwnABI } from "@/abi/RentToOwn";
import { PaymentType, useCreateProperty } from "@/services/request/contract/contract-request";
import { getParsedError } from "@/utils/scaffold-eth";
import { formatDurationFromMonths, priceFormatter } from "@/utils/formatter";
import { useContractLogs, useScaffoldEventHistory } from "@/hooks/scaffold-eth";
import { PropertyTokenContract, RenToOwnAddress } from "@/constants/contract-address";
import { Contract, ethers, JsonRpcProvider } from "ethers";
import { genericContractRequestRentToOwn } from "@/services/request/contract/generic";
import { readEventLogsFromWagmi } from "@/hooks/useRadEventFromWagmi";
 
const formSchema = z.object({
  files: z
        .array(z.custom<File>())
        .min(1, "Please select at least one file")
        .max(1, "Yoou can upload only a single file")
        .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), {
            message: "File size must be less than 5MB",
            path: ["files"],
        }
    ),
    propertY_name: z.string({required_error: "Poperty name is required"}),
    propertY_address: z.string({required_error: "Poperty addres is required"}),
    city: z.string({required_error: "City is required"}),
    state: z.string({required_error: "State is required"}),
    zip_code: z.string({required_error: "please provide a valid zipcode"}),
    price: z.number().min(1, { message: "Price is required" }),
    duration: z.number().min(1, { message: "Price is required" }),
    currency: z.string().min(1, { message: "Currency is required" }),
    flexible_payment: z.boolean()
});
 
type FormValues = z.infer<typeof formSchema>;
type uploadStatus = "idle" | "uploading" | "minting" | "success" | "error";


const LandlordCreate= () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
      flexible_payment: false
    },
  });
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false)
  const [status, setStatus] = useState<uploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {writeAsync: createProperty, isLoading: isLoading} = useCreateProperty()


  
const showPreview = async () => {
    console.log(form.getValues())
    const v = await form.trigger()

    if (v) {
    setPreviewOpen(true)
    }
}

const onSubmit = async (data: z.infer<typeof formSchema>) => {
console.log("Hello")
setStatus("uploading");
setUploadProgress("Starting to create property");


try {

    // Upload image to IPFS
    const imageUrl = await uploadToIPFS(data.files[0]);
    setUploadProgress("Uploading metadata to IPFS...");

    // Create and upload metadata
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
    zip_code: data.zip_code
    });

    setUploadProgress("Minting NFT...");
    setStatus("minting");
    setUploadProgress("");
    // Mint NFT with specified token ID to recipient address
    await createPropertyFn({
    city: data.city,
    currency: data.currency,
    duration: data.duration,
    propertyAddr: data.propertY_address,
    name: data.propertY_name,
    state: data.state,
    zipCode: data.zip_code,
    paymentType: data.flexible_payment ? PaymentType.Flexible : PaymentType.Fixed,
    image: imageUrl,
    value: data.price
    })
} catch (error) {
    // toast.error("An error occured while creating a property")
    // setStatus("error");
    console.error(error)
    toast.error(error instanceof Error ? error.message : "Transaction failed")
//     toast.error(
//         error instanceof Error ? error.message : "Failed to mint NFT"
//     );
}
}

const createPropertyFn = async (
    {city, currency, duration, image, name, paymentType, propertyAddr, state, value, zipCode}: {
        value:    number,
        duration: number,
        paymentType: PaymentType,
        name: string,
        image: string,
        propertyAddr: string,
        city: string,
        state: string,
        zipCode: string,
        currency: string
    }
) => {
    try {
        const tx = await createProperty({args: [
            value,
            duration,
            paymentType,
            name,
            image,
            propertyAddr,
            city,
            state,
            zipCode,
            currency
        ]})
        setTxHash(tx.hash);
    }catch (err) {
        const error = getParsedError(err)
        toast.error(error)
    }
}

useWaitForTransaction({
    hash: txHash,
    confirmations: 1,
    enabled: !!txHash,
    onSuccess() {
        setStatus("success");
        form.reset()
        setPreviewOpen(false)
        toast.success(`Property created successfully. Tnx  hash ${txHash}`)
      // navigate or update UI here
    },
    onError(error) {
      console.error("Tx failed to confirm", error);
    },
});

const calculateEquity = () => {
    const monthlyRent = form.getValues("price")/form.getValues("duration")
    const ownershipFraction = (monthlyRent/form.getValues("price")) * 100  // Percentage ownership
    return ownershipFraction
}


  return (
    <main className=" bg-gray-100 pb-16">
        <div className="content-container bg-white mt-16 py-10 rounded-lg">
            <p className="text-slate-700 font-semibold text-xl mb-5">Create Property</p>
            <Form {...form}>
                <form className="w-full flex flex-col gap-y-5">
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
                                    field.onChange(e)
                                    if (e[0]){
                                        setPreviewUrl(URL.createObjectURL(e[0]))
                                    }
                                }}
                                accept="image/*"
                                maxFiles={1}
                                maxSize={5 * 1024 * 1024}
                                onFileReject={(_, message) => {
                                    form.setError("files", {
                                    message,
                                    });
                                }}
                                // multiple
                                >
                                <FileUploadDropzone className="flex-row flex-wrap border-dotted text-center bg-gray-100 py-16">
                                    <CloudUpload className="size-4" />
                                    Drag and drop or
                                    <FileUploadTrigger asChild>
                                    <Button variant="link" size="sm" className="p-0">
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

                    <div className="flex items-start gap-x-6">
                        <div className="w-1/2">
                            <FormField
                                control={form.control}
                                name="propertY_name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Property Name</FormLabel>
                                    <FormControl className="">
                                        <Input className="py-6" placeholder="Owl CIty" {...field} />
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
                                    <FormControl className="">
                                        <Input className="py-6" placeholder="No 21 wall street" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-x-6">
                        <div className="w-1/3">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl className="">
                                        <Input className="py-6" placeholder="Harlem" {...field} />
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
                                    <FormControl className="">
                                        <Input className="py-6" placeholder="Kansas" {...field} />
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
                                    <FormLabel>Zip code</FormLabel>
                                    <FormControl className="">
                                        <Input className="py-6" placeholder="1234" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

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
                                                onCurrencySelect={(currency)=> {setSelectedCurrency(currency)}}
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
                                    <FormControl className="">
                                        <Input 
                                            {...field} 
                                            className="py-6" 
                                            type="number" 
                                            placeholder="Owl CIty" 
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
                                            id="enable-feature-disabled"
                                        />
                                    </FormControl>

                                    <FormLabel htmlFor="enable-feature-disabled" className="pl-3">Accept flexible payment</FormLabel>
                                    <FormDescription className="block">This allows the user to pay rent in lump sum as well</FormDescription>
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button onClick={() => {showPreview()}} type="button" className="mt-4 py-6">
                        Preview
                    </Button>


                    <Dialog  open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogTrigger className="hidden">Open</DialogTrigger>
                        <DialogContent>
                            <DialogHeader>

                            <DialogTitle className="">Property Preview</DialogTitle>
                            {/* <DialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </DialogDescription> */}

                            <img
                                src={previewUrl ?? ""}
                                alt={""}
                                className="h-56 w-full object-cover object-center pt-2"
                            />
                            </DialogHeader>
                            
                            <div className="flex flex-col gap-2 text-gray-600 text-sm">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold">{form.getValues("propertY_name")}</p>
                                    <Badge className="p-1 bg-gray-100 rounded-full w-max text-slate-600 text-base font-semibold">Token #100</Badge>
                                </div>

                                <p className="text-sm capitalize">{form.getValues("propertY_address")}</p>

                                <div className="flex items-center justify-between mt-2">
                                    <p className="">Monthly Rent:</p>
                                    <p className="text-lg">{form.getValues("currency")} {priceFormatter(form.getValues("price")/form.getValues("duration"), 4)}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="">Property Value:</p>
                                    <p className="text-lg">{form.getValues("currency")} {priceFormatter(form.getValues("price"), 4)}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="">Equity ratio:</p>
                                    <p className="text-base">{calculateEquity()}% monthly</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="">Estimated ownership transfer period:</p>
                                    <p className="text-base font-medium">{formatDurationFromMonths(form.getValues("duration"))}</p>
                                </div>
                            </div>

                            { form.getValues("flexible_payment") &&
                                <div className="text-sm text-green-600">Since flexible payment is allowed, payment can be completed in less than the specified duration</div>
                            }
                            <div className="mt-3">
                                <Alert className="border-blue-600/50 text-blue-600 bg-blue-400/20 dark:border-blue-600 [&>svg]:text-blue-600">
                                    <InfoIcon className="h-4 w-4" />
                                    <AlertTitle className="pb-2">Important Information</AlertTitle>
                                    <AlertDescription>
                                        You will get 100 Tokens, representing full ownership of this property. Equity is calculated based on your set duration, as well monthly payment
                                        (ie )
                                    </AlertDescription>
                                </Alert>
                            </div>

                            <div className="">
                                <div className="">
                                    {uploadProgress && (
                                        <div className="text-sm text-muted-foreground">{uploadProgress}</div>
                                    )}
      
                                </div>
                                <Button onClick={form.handleSubmit(onSubmit)} type="submit" className="py-6 rounded-md font-medium w-full">
                                    {status === "uploading" || status === "minting" ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        {status === "uploading" ? "Creating Property..." : "Assigning Ownership..."}
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
}

export default LandlordCreate