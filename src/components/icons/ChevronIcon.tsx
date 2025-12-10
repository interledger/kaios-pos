import { h } from "preact";
export function ChevronIcon({
  fill = "currentColor",
  ...props
}: { fill?: string } & preact.JSX.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clip-path="url(#clip0_488_5622)">
        <path
          d="M8 7.41L12.58 12L8 16.59L9.41 18L15.41 12L9.41 6L8 7.41Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_488_5622">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
