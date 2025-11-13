export const metadata = {
  title: "Order Complete | dusbullion.com",
};

export default function SuccessPage() {
  return (
    <section className="section py-12">
      <h1 className="text-2xl font-semibold">Thank you for your order</h1>
      <p className="mt-2 text-neutral-600">
        Your payment was successful. We’re locking in your price and preparing shipment.
        You’ll receive an email with your order details shortly.
      </p>
    </section>
  );
}
