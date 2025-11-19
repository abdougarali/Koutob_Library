import { requireAdmin } from "@/lib/adminAuth";
import { dbConnect } from "@/lib/dbConnect";
import { OrderModel } from "@/lib/models/Order";
import { PrintButton } from "@/components/admin/orders/PrintButton";

type InvoicePageProps = {
  params: Promise<{ orderCode: string }>;
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  await requireAdmin();
  const { orderCode } = await params;
  await dbConnect();
  const order = await OrderModel.findOne({ orderCode }).lean();
  if (!order) {
    return <div className="p-8">الطلب غير موجود</div>;
  }

  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString("ar-TN") : "";

  return (
    <div className="mx-auto my-8 w-full max-w-3xl rounded-2xl bg-white p-8 shadow print:shadow-none">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">فاتورة الطلب</h1>
        <PrintButton className="print:hidden" />
      </div>
      <div className="mb-4 text-sm text-gray-600">
        <div>رقم الطلب: {order.orderCode}</div>
        <div>التاريخ: {createdAt}</div>
        <div>الحالة: {order.status}</div>
      </div>
      <div className="mb-6 rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">العميل</h2>
        <div className="text-sm">
          <div>الاسم: {order.customerName}</div>
          <div>الهاتف: {order.phone}</div>
          {order.email && <div>البريد: {order.email}</div>}
          <div>المدينة: {order.city}</div>
          <div>العنوان: {order.address}</div>
        </div>
      </div>
      <div className="mb-6 rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">المنتجات</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-right">العنصر</th>
              <th className="py-2 text-right">الكمية</th>
              <th className="py-2 text-right">السعر</th>
              <th className="py-2 text-right">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((it: any, idx: number) => (
              <tr className="border-b" key={idx}>
                <td className="py-2">{it.title}</td>
                <td className="py-2">{it.quantity}</td>
                <td className="py-2">{Number(it.price ?? 0).toFixed(3)} د.ت</td>
                <td className="py-2">
                  {(Number(it.price ?? 0) * Number(it.quantity ?? 0)).toFixed(3)} د.ت
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ml-auto w-full max-w-xs rounded-xl border p-4 text-sm">
        <div className="mb-2 flex justify-between">
          <span>المجموع الفرعي</span>
          <span>{Number(order.subtotal ?? 0).toFixed(3)} د.ت</span>
        </div>
        {order.discountCode && order.discountAmount && order.discountAmount > 0 && (
          <div className="mb-2 flex justify-between text-[color:var(--color-primary)]">
            <span>
              خصم ({order.discountCode})
            </span>
            <span>-{Number(order.discountAmount ?? 0).toFixed(3)} د.ت</span>
          </div>
        )}
        <div className="mb-2 flex justify-between">
          <span>مصاريف التوصيل</span>
          <span>{Number(order.deliveryFees ?? 0).toFixed(3)} د.ت</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>الإجمالي</span>
          <span>{Number(order.total ?? 0).toFixed(3)} د.ت</span>
        </div>
      </div>
      {order.notes && (
        <div className="mt-4 rounded-xl border p-4 text-sm">
          <div className="mb-1 font-semibold">ملاحظات:</div>
          <div>{order.notes}</div>
        </div>
      )}
    </div>
  );
}


