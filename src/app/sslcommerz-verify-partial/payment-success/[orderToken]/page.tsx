import SslCommerzVerifyPartialClient from "@/components/PaymentResult/SslCommerzVerifyPartialClient";

interface PageProps {
  params: Promise<{ orderToken: string }>;
}

export default async function SslPartialPaymentSuccessTokenPage({ params }: PageProps) {
  const { orderToken } = await params;
  return (
    <SslCommerzVerifyPartialClient orderToken={orderToken} payState="payment-success" routeOutcome="success" />
  );
}
