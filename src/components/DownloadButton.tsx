import React, { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, AlertTriangle } from "lucide-react";

let canvasForColor: HTMLCanvasElement | null = null;
let ctxForColor: CanvasRenderingContext2D | null = null;
let tempElForResolution: HTMLDivElement | null = null;
let isResolvingColor = false;

function resolveColorToRgb(colorStr: string, element?: Element): string {
  if (!colorStr) return colorStr;
  
  // If it doesn't contain any problematic modern color definitions, return as-is
  if (
    !colorStr.includes("oklch") &&
    !colorStr.includes("oklab") &&
    !colorStr.includes("color-mix")
  ) {
    return colorStr;
  }

  // Standalone fallback function used to prevent any possible infinite recursion loop
  const parseColorFallbackOnly = () => {
    const lower = colorStr.toLowerCase();
    
    // Is it orange brand color?
    if (lower.includes("orange") || lower.includes("f15a") || lower.includes("241")) {
      const percentMatch = lower.match(/(\d+)%/);
      if (percentMatch) {
        const alpha = parseFloat(percentMatch[1]) / 100;
        return `rgba(241, 100, 40, ${alpha})`;
      }
      return "#f15a24";
    }

    // Is it indigo / purple / blue brand colors?
    if (lower.includes("indigo") || lower.includes("4f46") || lower.includes("6366") || lower.includes("229")) {
      const percentMatch = lower.match(/(\d+)%/);
      if (percentMatch) {
        const alpha = parseFloat(percentMatch[1]) / 100;
        return `rgba(79, 70, 229, ${alpha})`;
      }
      return "#4f46e5";
    }

    // Is it slate / zinc / gray / neutral?
    if (lower.includes("slate") || lower.includes("zinc") || lower.includes("gray") || lower.includes("grey") || lower.includes("1e29") || lower.includes("cbd5") || lower.includes("94a3")) {
      const percentMatch = lower.match(/(\d+)%/);
      if (percentMatch) {
        const alpha = parseFloat(percentMatch[1]) / 100;
        return `rgba(30, 41, 59, ${alpha})`;
      }
      return "#1e293b";
    }

    // Canvas resolution without DOM query
    try {
      if (!canvasForColor) {
        canvasForColor = document.createElement("canvas");
        canvasForColor.width = 1;
        canvasForColor.height = 1;
      }
      if (!ctxForColor) {
        ctxForColor = canvasForColor.getContext("2d");
      }
      if (ctxForColor) {
        ctxForColor.fillStyle = "rgba(0,0,0,0)";
        ctxForColor.fillStyle = colorStr;
        const resolved = ctxForColor.fillStyle;
        if (
          resolved &&
          resolved !== "rgba(0,0,0,0)" &&
          resolved !== "#00000000" &&
          !resolved.includes("oklch") &&
          !resolved.includes("oklab") &&
          !resolved.includes("color-mix")
        ) {
          return resolved;
        }
      }
    } catch (err) {
      // disregard
    }

    return "#000000"; // Absolute safe fallback default
  };

  if (isResolvingColor) {
    return parseColorFallbackOnly();
  }

  isResolvingColor = true;
  try {
    // 1. Try resolving using a temporary DOM element attached to the active document
    try {
      const activeDoc = element?.ownerDocument || document;
      const activeWin = (activeDoc.defaultView || window) as any;

      if (!tempElForResolution) {
        tempElForResolution = activeDoc.createElement("div");
        tempElForResolution.style.display = "none";
        tempElForResolution.style.position = "fixed";
        tempElForResolution.style.pointerEvents = "none";
        tempElForResolution.style.visibility = "hidden";
      }
      
      // Append temporarily to inherit variables/root contexts
      if (activeDoc.body) {
        activeDoc.body.appendChild(tempElForResolution);
      }

      tempElForResolution.style.color = "";
      tempElForResolution.style.color = colorStr;

      // Use native original getComputedStyle to bypass proxy completely
      const getStyle = activeWin.__original_getComputedStyle || activeWin.getComputedStyle;
      const computedStyle = getStyle(tempElForResolution);
      const resolved = computedStyle ? computedStyle.color : null;

      // Detach
      if (tempElForResolution.parentNode) {
        tempElForResolution.parentNode.removeChild(tempElForResolution);
      }

      if (
        resolved &&
        !resolved.includes("oklch") &&
        !resolved.includes("oklab") &&
        !resolved.includes("color-mix") &&
        resolved !== "rgba(0,0,0,0)" &&
        resolved !== "rgba(0, 0, 0, 0)"
      ) {
        return resolved;
      }
    } catch (err) {
      console.warn("DOM resolution failed for:", colorStr, err);
    }

    return parseColorFallbackOnly();
  } finally {
    isResolvingColor = false;
  }
}

const COLOR_PROPERTIES = new Set([
  "color",
  "background",
  "background-color",
  "backgroundColor",
  "border",
  "border-color",
  "borderColor",
  "border-top-color",
  "borderTopColor",
  "border-bottom-color",
  "borderBottomColor",
  "border-left-color",
  "borderLeftColor",
  "border-right-color",
  "borderRightColor",
  "outline",
  "outlineColor",
  "outline-color",
  "fill",
  "stroke"
]);

const proxyGetComputedStyle = (win: Window, orig: typeof window.getComputedStyle) => {
  return function(this: any, el: Element, pseudoEl?: string) {
    const context = this === win || (typeof Window !== "undefined" && this instanceof Window) ? this : win;
    let style;
    try {
      style = orig.call(context, el, pseudoEl);
    } catch (e) {
      style = orig(el, pseudoEl);
    }
    if (!style) return style;
    
    return new Proxy(style, {
      get(target, prop, receiver) {
        if (prop === "getPropertyValue") {
          return (propertyName: string) => {
            const val = target.getPropertyValue(propertyName);
            if (
              typeof val === "string" &&
              COLOR_PROPERTIES.has(propertyName) &&
              (val.includes("oklch") || val.includes("oklab") || val.includes("color-mix"))
            ) {
              return resolveColorToRgb(val, el);
            }
            return val;
          };
        }
        
        if (typeof prop !== "string") {
          return Reflect.get(target, prop, target);
        }

        const val = (target as any)[prop];
        if (typeof val === "function") {
          return val.bind(target);
        }
        if (
          typeof val === "string" &&
          COLOR_PROPERTIES.has(prop) &&
          (val.includes("oklch") || val.includes("oklab") || val.includes("color-mix"))
        ) {
          return resolveColorToRgb(val, el);
        }
        return val;
      }
    });
  };
};

function preprocessCss(css: string): string {
  if (!css) return css;

  // 1. Replace oklch(...) patterns with hex fallbacks
  css = css.replace(/oklch\([^)]+\)/gi, (match) => {
    const lower = match.toLowerCase();
    if (lower.includes("orange") || lower.includes("0.609") || lower.includes("0.244") || lower.includes("38")) return "#f15a24";
    if (lower.includes("slate") || lower.includes("0.208") || lower.includes("0.042") || lower.includes("265")) return "#1e293b";
    return "#000000";
  });

  // 2. Replace oklab(...) patterns
  css = css.replace(/oklab\([^)]+\)/gi, "#000000");

  // 3. Robust balanced parenthesis matching for color-mix(...)
  let index = 0;
  while (true) {
    const mixStart = css.indexOf("color-mix(", index);
    if (mixStart === -1) break;

    let parenCount = 1;
    let scanIndex = mixStart + "color-mix(".length;
    while (scanIndex < css.length && parenCount > 0) {
      const char = css[scanIndex];
      if (char === "(") parenCount++;
      else if (char === ")") parenCount--;
      scanIndex++;
    }

    if (parenCount === 0) {
      const fullMixToken = css.substring(mixStart, scanIndex);
      const lowerToken = fullMixToken.toLowerCase();

      let fallbackColor = "#000000";
      const percentMatch = lowerToken.match(/(\d+)%/);
      const opacity = percentMatch ? parseFloat(percentMatch[1]) / 100 : 1;

      if (lowerToken.includes("orange") || lowerToken.includes("f15a")) {
        fallbackColor = percentMatch ? `rgba(241, 100, 40, ${opacity})` : "#f15a24";
      } else if (lowerToken.includes("indigo") || lowerToken.includes("4f46")) {
        fallbackColor = percentMatch ? `rgba(79, 70, 229, ${opacity})` : "#4f46e5";
      } else if (lowerToken.includes("slate") || lowerToken.includes("zinc") || lowerToken.includes("gray") || lowerToken.includes("1e29")) {
        fallbackColor = percentMatch ? `rgba(30, 41, 59, ${opacity})` : "#1e293b";
      } else if (lowerToken.includes("white") || lowerToken.includes("ffffff")) {
        fallbackColor = percentMatch ? `rgba(255, 255, 255, ${opacity})` : "#ffffff";
      } else if (lowerToken.includes("black") || lowerToken.includes("000000")) {
        fallbackColor = percentMatch ? `rgba(0, 0, 0, ${opacity})` : "#000000";
      } else if (opacity < 1) {
        fallbackColor = `rgba(0, 0, 0, ${opacity})`;
      }

      css = css.substring(0, mixStart) + fallbackColor + css.substring(scanIndex);
      index = mixStart + fallbackColor.length;
    } else {
      index = mixStart + 1;
    }
  }

  return css;
}

interface DownloadButtonProps {
  elementRef: React.RefObject<HTMLDivElement | null>;
  fullName: string;
  onStartExport?: () => void;
  onSuccessExport?: () => void;
  onErrorExport?: (err: Error) => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  elementRef,
  fullName,
  onStartExport,
  onSuccessExport,
  onErrorExport,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const cleanFileName = (name: string): string => {
    const defaultName = "Student";
    const base = name.trim() ? name.trim().replace(/\s+/g, "_") : defaultName;
    return `Acceptance_Letter_${base}.pdf`;
  };

  const handleDownloadPDF = async () => {
    const element = elementRef.current;
    if (!element) {
      const err = new Error("Document container element not loaded");
      onErrorExport?.(err);
      setErrorText("Preview document element is missing");
      return;
    }

    try {
      setIsExporting(true);
      setErrorText(null);
      onStartExport?.();

      // Short delay to let any rendering/fonts finish cleanly (crucial for visual precision)
      await new Promise((res) => setTimeout(res, 350));

      const originalGetComputedStyle = window.getComputedStyle;
      (window as any).__original_getComputedStyle = originalGetComputedStyle;
      let getComputedStylePatched = false;
      try {
        window.getComputedStyle = proxyGetComputedStyle(window, originalGetComputedStyle);
        getComputedStylePatched = true;
      } catch (e) {
        console.warn("Could not patch window.getComputedStyle:", e);
      }

      let canvas;
      try {
        // Capture element as high-density canvas using precise options
        canvas = await html2canvas(element, {
          scale: 2.5, // High resolution crisp canvas to prevent blurry fonts
          useCORS: true, // Allow external elements if any
          allowTaint: true, // Taint images to run locally safely
          logging: false, // Turn off slow log diagnostics
          backgroundColor: "#FFFFFF", // Lock background color to default pure white
          windowWidth: 800, // Fixed capturing width to preserve A4 responsiveness perfectly
          onclone: (clonedDoc) => {
            const clonedWin = clonedDoc.defaultView;
            if (clonedWin) {
              try {
                const origClonedGetComputedStyle = clonedWin.getComputedStyle;
                (clonedWin as any).__original_getComputedStyle = origClonedGetComputedStyle;
                clonedWin.getComputedStyle = proxyGetComputedStyle(clonedWin, origClonedGetComputedStyle);
              } catch (e) {
                console.warn("Could not patch cloned window getComputedStyle:", e);
              }
            }

            // 1. Extract, merge, and sanitize ALL stylesheets from the parent/origin document
            let combinedCss = "";
            try {
              Array.from(window.document.styleSheets).forEach((sheet) => {
                try {
                  const rules = sheet.cssRules || (sheet as any).rules;
                  if (rules) {
                    Array.from(rules).forEach((rule: any) => {
                      try {
                        combinedCss += rule.cssText + "\n";
                      } catch (ruleErr) {
                        // Safe ignore individual bad rules
                      }
                    });
                  }
                } catch (e) {
                  // Catch cross-origin stylesheet access issues safely
                }
              });
            } catch (e) {
              console.warn("Could not read original document stylesheets:", e);
            }

            // Remove any oklch(...), oklab(...), and color-mix(...) function references from our merged CSS using preprocessCss
            if (combinedCss) {
              try {
                combinedCss = preprocessCss(combinedCss);
              } catch (e) {
                console.error("preprocessCss failed on combinedCss:", e);
              }
            }

            // Remove ALL link stylesheets in the cloned document so html2canvas doesn't try to load them and crash
            try {
              clonedDoc.querySelectorAll("link[rel='stylesheet']").forEach((link) => {
                link.parentNode?.removeChild(link);
              });
            } catch (e) {
              console.warn("Error removing link tags in clone:", e);
            }

            // Remove any existing style tags in the cloned document to avoid collisions
            try {
              clonedDoc.querySelectorAll("style").forEach((styleTag) => {
                styleTag.parentNode?.removeChild(styleTag);
              });
            } catch (e) {
              console.warn("Error removing style tags in clone:", e);
            }

            // Inject our combined, clean, OKLCH-free CSS into a single style tag in the cloned document
            try {
              const newStyleTag = clonedDoc.createElement("style");
              newStyleTag.textContent = combinedCss;
              clonedDoc.head.appendChild(newStyleTag);
            } catch (e) {
              console.warn("Error injecting sanitized stylesheet in clone:", e);
            }

            // 3. Sanitize inline styles of any elements containing oklch, oklab, or color-mix
            try {
              clonedDoc.querySelectorAll("[style]").forEach((el) => {
                const styleAttr = el.getAttribute("style") || "";
                if (styleAttr.includes("oklch") || styleAttr.includes("oklab") || styleAttr.includes("color-mix")) {
                  try {
                    const cleaned = preprocessCss(styleAttr);
                    el.setAttribute("style", cleaned);
                  } catch (preprocessErr) {
                    let cleaned = styleAttr.replace(/oklch\([^)]+\)/g, "#000000");
                    cleaned = cleaned.replace(/oklab\([^)]+\)/g, "#000000");
                    el.setAttribute("style", cleaned);
                  }
                }
              });
            } catch (e) {
              console.warn("Error sanitizing cloned elements inline styles:", e);
            }

            // 4. Modify cloned template elements during capture if needed
            const clonedElement = clonedDoc.getElementById("acceptance-letter-document");
            if (clonedElement) {
              clonedElement.style.boxShadow = "none";
              clonedElement.style.border = "none";
              clonedElement.style.borderRadius = "0";
              clonedElement.style.margin = "0";
              clonedElement.style.padding = "48px";

              // Strip highlight styling from any dynamic spans and make them normal font weight
              const highlightedSpans = clonedElement.querySelectorAll("span");
              highlightedSpans.forEach((span) => {
                // Completely strip out highlight bg/border style/helper classes
                span.classList.remove(
                  "bg-indigo-50",
                  "bg-amber-50",
                  "border",
                  "border-dashed",
                  "border-indigo-150",
                  "border-amber-300",
                  "rounded",
                  "px-1",
                  "py-0.5",
                  "font-semibold",
                  "transition-colors",
                  "duration-200"
                );
                span.style.backgroundColor = "transparent";
                span.style.background = "transparent";
                span.style.border = "none";
                span.style.padding = "0";
                span.style.margin = "0";
                span.style.color = "#000000";
                span.style.fontWeight = "normal";
                span.style.borderRadius = "0";
                span.classList.remove("font-bold", "font-extrabold", "font-semibold");
                span.classList.add("font-normal");
              });
            }
          }
        });
      } finally {
        if (getComputedStylePatched) {
          try {
            window.getComputedStyle = originalGetComputedStyle;
          } catch (e) {
            try {
              Object.defineProperty(window, "getComputedStyle", {
                value: originalGetComputedStyle,
                configurable: true,
                writable: true
              });
            } catch (e2) {
              console.error("Could not restore window.getComputedStyle:", e2);
            }
          }
        }
      }

      if (!canvas) {
        throw new Error("Failed to capture document canvas");
      }

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      // Standard A4 dimensions in pt: portrait is 595.28 x 841.89 points
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Fit captured canvas image proportionally onto physical A4 paper size limits
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      const finalFileName = cleanFileName(fullName);
      pdf.save(finalFileName);

      onSuccessExport?.();
    } catch (err: any) {
      console.error("PDF generation failure:", err);
      setErrorText("Could not create PDF stream: " + (err.message || err));
      onErrorExport?.(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap sm:flex-nowrap gap-3">
        {/* PDF Download Trigger */}
        <button
          id="btn-download-pdf"
          type="button"
          disabled={isExporting}
          onClick={handleDownloadPDF}
          className={`flex-1 flex items-center justify-center gap-2 font-bold text-sm text-white py-3 px-5 rounded shadow-sm transition-all cursor-pointer ${
            isExporting
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-md shadow-indigo-100"
          }`}
        >
          {isExporting ? (
            <>
              {/* Spinner */}
              <svg className="animate-spin -ml-1 mr-2 h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating Crisp PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4.5 h-4.5" />
              <span>Download PDF Document</span>
            </>
          )}
        </button>
      </div>

      {errorText && (
        <div className="flex gap-2 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded mt-2 items-center border border-red-200">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorText}</span>
        </div>
      )}
    </div>
  );
};
