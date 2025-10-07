import { useTheme } from "@/contexts/ThemeContext";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-md group-[.toaster]:rounded-2xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-foreground/70 group-[.toast]:text-sm group-[.toast]:leading-relaxed",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:hover:bg-primary/90",
          cancelButton: "group-[.toast]:bg-muted/50 group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:hover:bg-muted/70",
          title: "group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:leading-tight",
          closeButton: "group-[.toast]:text-foreground/40 group-[.toast]:hover:text-foreground/70 group-[.toast]:hover:bg-foreground/5 group-[.toast]:rounded-full group-[.toast]:p-1.5 group-[.toast]:transition-all group-[.toast]:duration-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
