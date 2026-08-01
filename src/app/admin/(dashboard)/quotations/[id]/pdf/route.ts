import { NextResponse } from "next/server";
import { requirePermission, ForbiddenError } from "@/lib/permissions";
import { UnauthorizedError } from "@/lib/auth/session";
import { getQuotationById } from "@/modules/quotations/queries";
import { renderQuotationPdf } from "@/modules/quotations/pdf";

/** Generated on-demand — defaults to `inline` preview to prevent forced local downloads. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("quotations.view");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Not permitted" }, { status: 403 });
    }
    throw error;
  }

  const { id } = await params;
  const quotation = await getQuotationById(id);
  if (!quotation) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  const pdf = await renderQuotationPdf(quotation);

  const { searchParams } = new URL(request.url);
  const forceDownload = searchParams.get("download") === "1";
  const disposition = forceDownload ? "attachment" : "inline";

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${quotation.quotationNumber}.pdf"`,
    },
  });
}
