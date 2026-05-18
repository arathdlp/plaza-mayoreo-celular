export type MercadoPagoPaymentSnapshot = {
  id: number | string;
  status: string;
  external_reference: string | null;
};

export async function fetchMercadoPagoPayment(
  paymentId: string,
  accessToken: string,
): Promise<MercadoPagoPaymentSnapshot | null> {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[MP payment]", res.status, text.slice(0, 400));
    return null;
  }

  const data = (await res.json()) as {
    id?: number | string;
    status?: string;
    external_reference?: string | null;
  };

  if (data.id == null || !data.status) {
    return null;
  }

  return {
    id: data.id,
    status: data.status,
    external_reference: data.external_reference ?? null,
  };
}
