export function DataTableEmptyRow({
  colSpan,
  title,
  description,
}: {
  colSpan: number;
  title: string;
  description?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center">
        <p className="text-sm font-semibold text-white">{title}</p>
        {description ? (
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/52">
            {description}
          </p>
        ) : null}
      </td>
    </tr>
  );
}
