import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Webhook, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem("ssu-webhook-url") || ""
  );
  const [callbackUrl, setCallbackUrl] = useState(
    localStorage.getItem("ssu-callback-url") || ""
  );
  const [generatedCallbackUrl, setGeneratedCallbackUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Generate a unique callback URL for this system
    const baseUrl = window.location.origin;
    const uniqueId = localStorage.getItem("ssu-callback-id") || generateUniqueId();
    localStorage.setItem("ssu-callback-id", uniqueId);
    const generated = `${baseUrl}/api/callback/${uniqueId}`;
    setGeneratedCallbackUrl(generated);
    
    if (!callbackUrl) {
      setCallbackUrl(generated);
    }
  }, []);

  const generateUniqueId = () => {
    return `ssu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSave = () => {
    localStorage.setItem("ssu-webhook-url", webhookUrl);
    localStorage.setItem("ssu-callback-url", callbackUrl);
    
    toast({
      title: "Configurações salvas",
      description: "As integrações foram atualizadas com sucesso",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="bg-primary/10 p-2 md:p-3 rounded-lg">
          <Settings className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Configurações</h1>
          <p className="text-sm md:text-base text-muted-foreground">Integrações e webhooks</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Configuração de Integração
          </CardTitle>
          <CardDescription>
            Configure as URLs de webhook e callback para sincronização de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="text-sm md:text-base">URL do Webhook (Destino)</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://api.exemplo.com/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="font-mono text-xs md:text-sm"
            />
            <p className="text-xs text-muted-foreground">
              URL para envio dos chamados encerrados
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="callback-url" className="text-sm md:text-base">URL de Callback (Confirmação)</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="callback-url"
                type="url"
                value={generatedCallbackUrl}
                readOnly
                className="font-mono text-xs md:text-sm bg-muted flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(generatedCallbackUrl)}
                className="w-full sm:w-auto"
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              URL gerada automaticamente para receber confirmações HTTP Request (OK/NOK)
            </p>
            <div className="mt-2 p-2 md:p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                Como usar:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li className="break-all">POST: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded break-all">{"{ \"status\": \"OK\" }"}</code></li>
                <li className="break-all">Erro: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded break-all">{"{ \"status\": \"NOK\" }"}</code></li>
                <li>Sistema aguarda confirmação antes de enviar próximo</li>
              </ul>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full sm:w-auto">
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
