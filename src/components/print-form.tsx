import { useState, useEffect, useRef, useId } from "react";
import { Button } from "./ui/button";
import { PrinterIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  name?: string;
  className?: string;
  children: React.ReactNode;
};

export const PrintForm = ({ name, className, children }: Props) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId(); // Generate unique ID for this print form instance

  useEffect(() => {
    const controller = new AbortController();

    const handleBeforePrint = () => {
      // Only handle global print events if this specific form is being printed
      if (isPrinting) {
        const rootElement = document.documentElement;
        const printElement = printContentRef.current;

        if (printElement) {
          document.body.classList.add("print-mode");
          printElement.classList.add("print-active");

          // Set CSS custom properties for @page margin boxes
          rootElement.style.setProperty(
            "--document-name",
            `"${name || "Document"}"`
          );
          rootElement.style.setProperty(
            "--print-date",
            `"${new Date().toLocaleDateString()}"`
          );
        }
      }
    };

    const handleAfterPrint = () => {
      setIsPrinting(false);
      // Clean up all print classes and custom properties
      const rootElement = document.documentElement;
      document.body.classList.remove("print-mode");
      rootElement.style.removeProperty("--document-name");
      rootElement.style.removeProperty("--print-date");

      // Remove print-active from all print forms
      const allPrintContents = document.querySelectorAll(".print-content");
      allPrintContents.forEach((el) => el.classList.remove("print-active"));
    };

    window.addEventListener("beforeprint", handleBeforePrint, {
      signal: controller.signal,
    });
    window.addEventListener("afterprint", handleAfterPrint, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [isPrinting]);

  const handlePrintClick = () => {
    if (!printContentRef.current) return;

    // Fallback to the CSS method if popup is blocked
    setIsPrinting(true);
    const rootElement = document.documentElement;
    const allPrintContents = document.querySelectorAll(".print-content");
    allPrintContents.forEach((el) => el.classList.remove("print-active"));

    document.body.classList.add("print-mode");
    rootElement.style.setProperty("--document-name", `"${name || "Document"}"`);
    rootElement.style.setProperty(
      "--print-date",
      `"${new Date().toLocaleDateString()}"`
    );
    printContentRef.current.classList.add("print-active");

    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className={cn("w-full border print-form-container", className)}>
      <div className="flex justify-between p-6 print:hidden">
        <div className="text-lg font-bold">{name}</div>
        <Button size="icon" variant="outline" onClick={handlePrintClick}>
          <PrinterIcon />
        </Button>
      </div>
      <div
        ref={printContentRef}
        className="p-6 print:p-0 print-content"
        data-print-id={uniqueId}
      >
        {children}
      </div>
    </div>
  );
};
