import BkashVerifyClient from "@/components/PaymentResult/BkashVerifyClient";

interface PageProps {
  params: Promise<{ orderToken: string }>;
}

export default async function BkashVerifyTokenPage({ params }: PageProps) {
  const { orderToken } = await params;
  return <BkashVerifyClient orderToken={orderToken} />;
}
