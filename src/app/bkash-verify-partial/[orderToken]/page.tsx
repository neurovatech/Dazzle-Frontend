import BkashVerifyPartialClient from "@/components/PaymentResult/BkashVerifyPartialClient";

interface PageProps {
  params: Promise<{ orderToken: string }>;
}

export default async function BkashVerifyPartialTokenPage({ params }: PageProps) {
  const { orderToken } = await params;
  return <BkashVerifyPartialClient orderToken={orderToken} />;
}
