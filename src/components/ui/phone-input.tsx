"use client";

import { useState } from "react";
import PhoneNumberInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Input } from "./input";

export interface PhoneInputProps {
  name: string;
  id?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}

/**
 * Shared Kenyan phone input — the standard `react-phone-number-input` flag +
 * country-code UI (defaulted to Kenya via `defaultCountry`, and restricted
 * to just Kenya via `countries` since this is a single-country store), not
 * a bare text field. Backed by `libphonenumber-js` internally, formatting
 * as the customer types and accepting `0712345678` / `712345678` /
 * `+254712345678` alike. `src/lib/phone.ts`'s `normalizeKenyanPhone`/
 * `kenyanPhoneSchema` — built on the same underlying library — are the
 * actual source of truth for validation/storage; this component is just
 * its UI half, so the two can never disagree on what counts as valid.
 */
export function PhoneInput({ name, id, defaultValue, required, className }: Readonly<PhoneInputProps>) {
  const [value, setValue] = useState<string | undefined>(defaultValue);

  return (
    <PhoneNumberInput
      id={id}
      name={name}
      value={value}
      onChange={setValue}
      defaultCountry="KE"
      countries={["KE"]}
      addInternationalOption={false}
      inputComponent={Input}
      required={required}
      className={className}
      placeholder="Enter phone number"
      autoComplete="off"
    />
  );
}
