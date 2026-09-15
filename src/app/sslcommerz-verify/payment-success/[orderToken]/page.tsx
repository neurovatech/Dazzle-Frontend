import SslCommerzVerifyClient from "@/components/PaymentResult/SslCommerzVerifyClient";

interface PageProps {
  params: Promise<{ orderToken: string }>;
}

export default async function SslPaymentSuccessTokenPage({ params }: PageProps) {
  const { orderToken } = await params;
  return (
    <SslCommerzVerifyClient orderToken={orderToken} payState="payment-success" routeOutcome="success" />
  );
}
