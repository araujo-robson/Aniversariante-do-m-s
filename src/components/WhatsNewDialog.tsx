import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CURRENT_VERSION = "1.4";

const WhatsNewDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("whats-new-seen");
    if (seen !== CURRENT_VERSION) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("whats-new-seen", CURRENT_VERSION);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">🎉 O que há de novo?</DialogTitle>
          <DialogDescription className="text-base font-medium text-foreground/80">
            Versão {CURRENT_VERSION} disponível
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-semibold text-primary">🔧 Correção:</span>{" "}
            Resolvido o problema que fazia imagens desaparecerem ao exportar ou recarregar o projeto. Agora todas as fotos são armazenadas de forma segura no IndexedDB, eliminando o limite de 5 MB do navegador e garantindo que suas imagens sejam preservadas integralmente nas exportações e importações.
          </div>
          <div>
            <span className="font-semibold text-primary">⚡ Melhoria:</span>{" "}
            Exportação e importação de projetos totalmente reformuladas para suportar dezenas de fotos em alta qualidade sem perda de dados.
          </div>
        </div>

        <Button onClick={handleClose} className="w-full mt-2">
          Continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewDialog;
