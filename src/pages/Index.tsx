import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="text-center space-y-6 md:space-y-8 p-4 md:p-8 max-w-2xl">
        <div className="mx-auto bg-gradient-primary w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
          <Shield className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
        </div>
        
        <div className="space-y-2 md:space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Portal SSU
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-md mx-auto px-4">
            Sistema de Gestão de Serviços Urbanos
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Prefeitura Municipal de Mauá
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => navigate("/login")}
          className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
        >
          Acessar Sistema
          <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
