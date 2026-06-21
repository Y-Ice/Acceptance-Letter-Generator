import React from "react";
import { AcceptanceData, LETTER_TEMPLATES } from "../types";
import nhubWatermarkImg from "../assets/images/nhub_watermark_1782037100337.jpg";

// Dynamic SVG logo matching DocuGen and nHub Foundation branding under Geometric Balance theme
export const NHubLogo = ({
  className = "w-24 h-24",
  opacity = 1,
  isWatermark = false,
}: {
  className?: string;
  opacity?: number;
  isWatermark?: boolean;
}) => (
  <div 
    id={isWatermark ? "letter-watermark" : "letter-logo-header"}
    className={`relative flex flex-col items-center justify-center select-none ${className}`} 
    style={{ opacity }}
  >
    <svg 
      viewBox="0 0 210 210" 
      className="w-full h-full z-10" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rotated Diamond Frame */}
      <rect 
        x="20" y="20" width="170" height="170" 
        transform="rotate(45 105 105)" 
        fill="none" 
        stroke={isWatermark ? "rgba(241, 100, 40, 0.08)" : "#cbd5e1"} 
        strokeWidth={isWatermark ? 1 : 1.25} 
      />
      
      {/* Slanted inner group along the bottom-right leg of the diamond */}
      <g transform="rotate(-45 105 105) translate(-3, 3)">
        {/* Stylized lowercase 'n' in bold brand orange */}
        <path 
          d="M 38 120 L 38 90 C 38 78 48 68 62 68 C 74 68 74 78 74 90 L 74 120" 
          stroke="#f15a24" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
        
        {/* Brand Orange Circle */}
        <circle 
          cx="106" 
          cy="70" 
          r="23" 
          stroke="#f15a24" 
          strokeWidth="5" 
          fill="none" 
        />
        
        {/* Black Empowered Person inside the circle */}
        <circle cx="106" cy="58.5" r="4.2" fill="#0f172a" />
        <path 
          d="M 97.5 86.5 C 97.5 76.5 90.5 70 82.5 66 C 92.5 65 99.5 68 106 73 C 112.5 68 119.5 65 129.5 66 C 121.5 70 114.5 76.5 114.5 86.5 Z" 
          fill="#0f172a" 
        />
        
        {/* Text FOUNDATION with tiny orange person representing 'A' */}
        <text 
          x="44" 
          y="116" 
          fontFamily="'Times New Roman', Times, Baskerville, Georgia, serif" 
          fontSize="15" 
          fontWeight="900" 
          fill="#0f172a" 
          letterSpacing="0.4"
        >
          FOUND
        </text>
        
        {/* Tiny Orange Person representing 'A' inside FOUNDATION */}
        <circle cx="106.5" cy="107.5" r="2.2" fill="#f15a24" />
        <path 
          d="M 103 119 C 103 114.5 101 111.5 97 110 C 99.5 109.5 103 111 106.5 112.5 C 110 111 113.5 109.5 116 110 C 112 111.5 110 114.5 110 119 Z" 
          fill="#f15a24" 
        />
        
        <text 
          x="114" 
          y="116" 
          fontFamily="'Times New Roman', Times, Baskerville, Georgia, serif" 
          fontSize="15" 
          fontWeight="900" 
          fill="#0f172a" 
          letterSpacing="0.4"
        >
          ION
        </text>
        
        {/* Slogan Underneath */}
        <text 
          x="105" 
          y="132" 
          fontFamily="'Times New Roman', Times, Baskerville, Georgia, serif" 
          fontSize="6.5" 
          fontStyle="italic" 
          fontWeight="600" 
          fill="#475569" 
          textAnchor="middle"
        >
          ...Empowering Young Africans
        </text>
      </g>
    </svg>
  </div>
);

// High-fidelity procedurally-generated deterministic QR code
export const QrCodeSvg = ({ value, size = 64 }: { value: string; size?: number }) => {
  const sizeGrid = 21;
  const dots: boolean[][] = Array.from({ length: sizeGrid }, () => Array(sizeGrid).fill(false));
  
  const setFinder = (r: number, c: number) => {
    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 7; y++) {
        const isBorder = x === 0 || x === 6 || y === 0 || y === 6;
        const isCenter = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        dots[r + x][c + y] = isBorder || isCenter;
      }
    }
  };
  
  setFinder(0, 0);
  setFinder(0, sizeGrid - 7);
  setFinder(sizeGrid - 7, 0);
  
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  
  for (let r = 0; r < sizeGrid; r++) {
    for (let c = 0; c < sizeGrid; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= sizeGrid - 8;
      const inBottomLeft = r >= sizeGrid - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      
      const seed = Math.abs(Math.sin((r * 17 + c * 31 + Math.abs(hash)) * 1319));
      dots[r][c] = seed > 0.46;
    }
  }
  
  const cellSize = size / sizeGrid;
  
  return (
    <div id="letter-qrcode" className="flex flex-col items-center bg-white p-1.5 border border-dashed border-slate-300 rounded shadow-xs">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white">
        {dots.map((row, r) => 
          row.map((val, c) => 
            val ? (
              <rect 
                key={`${r}-${c}`} 
                x={c * cellSize} 
                y={r * cellSize} 
                width={cellSize} 
                height={cellSize} 
                fill="#1e293b" 
              />
            ) : null
          )
        )}
      </svg>
      <span className="text-[7px] text-slate-400 font-mono mt-1 text-center scale-90">SECURE VERIFY</span>
    </div>
  );
};

// Hand-drawn vector-style signature paths matching user uploaded asset exactly
export const MockSignature = ({ name }: { name: string }) => {
  return (
    <svg 
      id="letter-signature-svg" 
      className="w-28 h-10 text-slate-800" 
      viewBox="0 0 140 50" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Top horizontal stroke */}
      <path d="M 15 15 L 115 11" stroke="#1e293b" strokeWidth="2" />
      {/* Left downward straight pen-drop stem */}
      <path d="M 45 14 L 43 25 L 53 45" stroke="#1e293b" strokeWidth="2.5" />
      {/* Middle cursive swoops and loop-de-loops representing the ink structure */}
      <path d="M 52 24 Q 72 20 88 25" stroke="#1e293b" strokeWidth="2" />
      <path d="M 56 28 C 74 28 80 34 68 34 C 54 34 58 26 84 26" stroke="#1e293b" strokeWidth="1.8" />
      {/* Underlying faint support line */}
      <path d="M 38 28 L 105 26" stroke="#475569" strokeWidth="1" opacity="0.5" />
    </svg>
  );
};

interface AcceptanceLetterProps {
  data: AcceptanceData;
  highlightMode?: boolean; // if true, placeholder values will be highlighted visually
  fontSizeScale?: number; // scale font size for layout fine-tuning (e.g. 1.0 = standard 14px)
}

export const AcceptanceLetter = React.forwardRef<HTMLDivElement, AcceptanceLetterProps>(
  ({ data, highlightMode = false, fontSizeScale = 1.0 }, ref) => {
    const selectedTemplate = LETTER_TEMPLATES.find((t) => t.id === data.templateId) || LETTER_TEMPLATES[0];

    // Helper to render text with beautiful styling or Indigo highlights for empty/filled fields
    const renderField = (value: string, placeholder: string) => {
      const isPlaceholder = !value || value.trim() === "";
      const textToDisplay = isPlaceholder ? placeholder : value;

      if (highlightMode) {
        return (
          <span 
            className={`transition-colors duration-200 px-1 py-0.5 rounded font-semibold ${
              isPlaceholder 
                ? "bg-amber-50 text-black border border-dashed border-amber-300" 
                : "bg-indigo-50 text-black border border-indigo-150"
            }`}
          >
            {textToDisplay}
          </span>
        );
      }
      return <span className={isPlaceholder ? "text-black/70 italic font-normal" : "text-black font-normal"}>{textToDisplay}</span>;
    };

    return (
      <div className="w-full overflow-auto flex justify-center bg-slate-200/50 p-2 sm:p-6 rounded border border-slate-350 min-h-[700px] shadow-xs">
        {/* Printable/Canvas Frame strictly sized in A4 Aspect Ratio */}
        <div
          ref={ref}
          id="acceptance-letter-document"
          className="relative bg-white text-black p-8 sm:p-14 md:p-16 w-full max-w-[800px] aspect-[1/1.414] overflow-hidden flex flex-col justify-between border border-slate-250 shadow-sm rounded-xs select-text"
          style={{
            fontSize: `${14 * fontSizeScale}px`,
            lineHeight: "1.6",
            fontFamily: '"Times New Roman", Times, Baskerville, Georgia, serif',
          }}
        >
          {/* Vertical Left Side Letterhead Accent Stripe */}
          <div className="absolute left-0 top-0 bottom-0 flex select-none pointer-events-none z-20">
            {/* Main brand orange block */}
            <div className="w-3 bg-[#f15a24]" />
            {/* Secondary slate-gray thin stripe */}
            <div className="w-[2px] bg-[#1e293b]/90" />
          </div>

          {/* Subtle Rotated watermark in the exact middle of the document */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img 
              src={nhubWatermarkImg} 
              alt="nHub Foundation Watermark" 
              className="w-[28rem] h-[28rem] object-contain select-none opacity-[0.4]" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Core Content Layer */}
          <div className="relative z-10 w-full flex flex-col justify-between h-full">
            
            {/* Header / Letterhead Block */}
            <div className="w-full flex flex-col">
              
              {/* Top Banner Grid (Aligned to the Right) */}
              <div className="flex justify-end w-full bg-transparent pb-1">
                
                {/* Sender Formal Contact Info (Right Aligned) */}
                <div className="text-right text-xs max-w-xs text-black space-y-0.5 leading-relaxed">
                  <p className="font-bold text-black text-sm">nhub Foundation</p>
                  <p>2nd Floor Taen Business Complex</p>
                  <p>Opposite Old Nitel Office Jos</p>
                  <p>Plateau State, Nigeria.</p>
                  <p className="text-[11px] text-black font-semibold pt-0.5">+234 806 864 0710 | +234 703 563 9491</p>
                  <p className="text-[11px] text-black hover:underline">contact@nhubfoundation.org</p>
                  <p className="text-[11px] text-black">nhubfoundation.org</p>
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="w-full border-t border-black my-4" />

              {/* Date Block (Right Aligned) */}
              <div className="w-full text-right text-xs md:text-sm text-black font-medium mb-4">
                {renderField(data.date, "Current Date")}
              </div>
            </div>

            {/* Recipient / Address Block (Left Aligned) */}
            <div className="w-full text-left space-y-1 my-2">
              <div className="text-black text-sm font-medium">
                <p>{renderField(data.institution, "Name of Institution")},</p>
                <p>Department of {renderField(data.department, "Insert your Department")},</p>
              </div>
              <p className="text-black">{data.salutation},</p>
            </div>

            {/* Letter Title Block (Centered) */}
            <div className="w-full text-center my-6">
              <h1 className="text-base md:text-lg font-bold tracking-wider text-black underline uppercase decoration-[1.5px] underline-offset-4">
                {selectedTemplate.subject}
              </h1>
            </div>

            {/* Body Content justified */}
            <div className="w-full text-justify text-black leading-relaxed space-y-4 flex-grow my-2">
              <p className="indent-8 text-sm md:text-base whitespace-pre-line font-normal">
                {selectedTemplate.id === "nhub-default" ? (
                  <>
                    We acknowledge the receipt of introduction for industrial training (INTERNSHIP) in respect to{" "}
                    {renderField(data.fullName, "Insert Full Name")} with matriculation number{" "}
                    {renderField(data.matricNo, "Insert Matric Number")} of the Department of{" "}
                    {renderField(data.department, "Insert your Department")} to undergo his/her Industrial Training in our organization.
                  </>
                ) : (
                  selectedTemplate.renderBody(data)
                )}
              </p>
            </div>

            {/* Verification & Sign-off Footer Block */}
            <div className="w-full flex justify-between items-end pt-6 mt-4 border-t border-dashed border-black">
              
              {/* Signatory details (Left) */}
              <div className="text-left space-y-1 flex-1">
                <p className="text-black font-medium text-sm">Kind Regards,</p>
                
                {/* Signature graphic */}
                <div className="py-2 flex items-center min-h-[48px]">
                  {data.hasSignature && (
                    data.customSignatureUrl ? (
                      <img 
                        id="letter-custom-signature"
                        src={data.customSignatureUrl} 
                        alt="Signature" 
                        className="h-10 w-auto object-contain max-w-xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <MockSignature name={data.signatoryName} />
                    )
                  )}
                </div>

                <div className="text-xs text-black leading-snug">
                  <p className="font-bold text-black text-sm">Bashir Sheidu</p>
                  <p className="font-medium text-black">Chief Operations Officer</p>
                  <p className="text-black text-[11px] font-semibold font-sans">nHub Foundation & nHub Nigeria</p>
                  <p className="text-black text-sm whitespace-nowrap">Tel: 08068640710</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
);

AcceptanceLetter.displayName = "AcceptanceLetter";
