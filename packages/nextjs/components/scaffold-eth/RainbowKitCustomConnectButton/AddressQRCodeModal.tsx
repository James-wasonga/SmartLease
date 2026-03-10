import { Address } from "@/components/scaffold-eth";
import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";

type AddressQRCodeModalProps = {
  address: AddressType;
  modalId: string;
};

export const AddressQRCodeModal = ({
  address,
  modalId,
}: AddressQRCodeModalProps) => {
  return (
    <>
      <div>
        <label htmlFor={`${modalId}`} className="modal cursor-pointer">
          <label className="modal-box relative">
            {/* dummy input to capture event onclick on modal box */}
            <input className="h-0 w-0 absolute top-0 left-0" />
            <div className="space-y-3 py-6">
              <div className="flex space-x-4 flex-col items-center gap-6">
                <QRCodeSVG value={address} size={256} />
                <Address address={address} format="long" disableAddressLink />
              </div>
            </div>
          </label>
        </label>
      </div>
    </>
  );
};
