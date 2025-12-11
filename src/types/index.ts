import { ReactNode } from 'react';


export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string;
  className?: string;
  zIndex?: number;
  showCloseButton?: boolean;
}


export interface TwitterAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export type WalletType = 'simulacrum' | 'metamask' | 'coinwallet' | 'coinlist' | 'torus';


export interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onConnectWallet: (walletType: WalletType) => void;
  onConnect?: (walletType: string) => void;
} 
export interface ConnectedSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onExplore: () => void
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}