// app/order-confirmation/[id]/page.tsx — placeholder
export default function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  return <div>Order Confirmed! Order ID: {params.id}</div>;
}
