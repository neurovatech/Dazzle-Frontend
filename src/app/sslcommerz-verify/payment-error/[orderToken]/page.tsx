import SslCommerzVerifyClient from "@/components/PaymentResult/SslCommerzVerifyClient";

interface PageProps {
  params: Promise<{ orderToken: string }>;
}

export default async function SslPaymentErrorTokenPage({ params }: PageProps) {
  const { orderToken } = await params;
  return (
    <SslCommerzVerifyClient orderToken={orderToken} payState="payment-error" routeOutcome="error" />
  );
}
