import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { ConnectButton } from '@/components/ConnectButton';
import Button from '@/components/Button';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletConnectModal = ({ isOpen, onClose }: WalletConnectModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="bg-[#0D0D0D] rounded-[24px] overflow-hidden w-[460px]">
          <div className="flex items-center justify-between px-6 pt-6 pb-8">
            <button className="p-1 hover:bg-white/5 rounded-full">
              <HelpCircle className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-[20px] font-medium text-white">Connect Wallet</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="px-4 pb-6 space-y-4">
            <div className="text-center">
              <p className="text-[#808080] text-[15px] mb-4">
                Connect your wallet to add it to your Bluff account
              </p>
            </div>

            <ConnectButton isWalletBalanceShow={false} usdcBalance={0}>
              <Button
                variant="primary"
                className="w-full h-[46px] text-[17px] font-medium"
                onClick={() => {
                  // The ConnectButton will handle opening the web3modal
                  // We can close this modal after a short delay to let the web3modal open
                  setTimeout(() => {
                    onClose();
                  }, 100);
                }}
              >
                Connect Wallet
              </Button>
            </ConnectButton>

            <div className="text-center">
              <p className="text-[#808080] text-[13px]">
                This will open the wallet connection modal where you can choose from 450+ supported wallets
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-4 border-t border-[#1A1A1A]">
            <span className="text-[#808080] text-[15px]">Haven&apos;t got a wallet?</span>
            <a href="#" className="text-[#4F7CFF] text-[15px] hover:opacity-80">
              Get started
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletConnectModal; 
