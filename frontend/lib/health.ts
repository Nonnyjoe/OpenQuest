import { toast } from "@/components/ui/use-toast";
import { authService } from "@/services/auth-service";

export async function checkHealth() {
  try {
    await authService.healthCheck();
    return true;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}

export function startHealthCheck(interval = 30000) {
  return setInterval(async () => {
    const isHealthy = await checkHealth();
    if (!isHealthy) {
      // Show toast or notification about service issues
      toast({
        title: "Service Issue",
        description: "We're experiencing some technical difficulties",
        variant: "destructive",
      });
    }
  }, interval);
}
