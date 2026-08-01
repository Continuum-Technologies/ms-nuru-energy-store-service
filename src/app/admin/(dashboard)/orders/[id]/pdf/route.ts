import { NextResponse } from "next/server";
import { requirePermission, ForbiddenError } from "@/lib/permissions";
import { UnauthorizedError } from "@/lib/auth/session";
import { getOrderById } from "@/modules/orders/queries";
import { renderOrderPdf } from "@/modules/orders/pdf";

/** Generated on-demand — defaults to `inline` preview to prevent forced local downloads. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("orders.view");
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
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const pdf = await renderOrderPdf(order);

  const { searchParams } = new URL(request.url);
  const forceDownload = searchParams.get("download") === "1";
  const disposition = forceDownload ? "attachment" : "inline";

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${order.orderNumber}.pdf"`,
    },
  });
}
