"use client";

import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { userService } from "@/services/user-service";
import { WalletConnect } from "@/components/wallet/wallet-connect";

export function LinkWallet() {
  const { address, isConnected } = useAccount();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLinkWallet = async () => {
    try {
      if (!isConnected) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }

      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to link your wallet",
          variant: "destructive",
        });
        return;
      }

      await userService.linkWallet(user.id, address as string);

      toast({
        title: "Wallet Linked Successfully",
        description: `Your wallet (${address?.slice(0, 6)}...${address?.slice(
          -4
        )}) has been linked to your account.`,
      });

      // Optionally reload the page to see updated wallet status
      window.location.reload();
    } catch (error) {
      console.error("Failed to link wallet:", error);
      toast({
        title: "Error",
        description: "Failed to link wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (user?.walletAddress) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Wallet Connected</p>
        <p className="text-sm font-medium">{user.walletAddress}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isConnected ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to participate in quizzes
          </p>
          <WalletConnect />
        </div>
      ) : (
        <Button onClick={handleLinkWallet}>Link Wallet Address</Button>
      )}
    </div>
  );
}
