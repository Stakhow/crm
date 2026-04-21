import { InputMask, type InputMaskProps } from "@react-input/mask";
import { forwardRef } from "react";

// 1. Create a wrapper component for the mask
export const UkraineMaskInput = forwardRef<HTMLInputElement, InputMaskProps>((props, ref) => (
    <InputMask {...props} ref={ref} mask="+38 (0__) ___-__-__" replacement={{ _: /\d/ }} />
));