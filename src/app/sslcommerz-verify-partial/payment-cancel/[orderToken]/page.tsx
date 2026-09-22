import SslCommerzVerifyPartialClient from "@/components/PaymentResult/SslCommerzVerifyPartialClient";

interface PageProps {
  params: Promise<{ orderToken: string }>;
}

export default async function SslPartialPaymentCancelTokenPage({ params }: PageProps) {
  const { orderToken } = await params;
  return (
    <SslCommerzVerifyPartialClient orderToken={orderToken} payState="payment-cancel" routeOutcome="cancel" />
  );
}
