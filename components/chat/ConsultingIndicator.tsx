export function ConsultingIndicator() {
  return (
    <div
      role="status"
      className="flex animate-pulse items-center gap-2.5 px-1 text-sm italic text-sub"
    >
      <span aria-hidden="true" className="flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-gold" />
        <span className="size-1.5 rounded-full bg-gold/70" />
        <span className="size-1.5 rounded-full bg-gold/40" />
      </span>
      Consulting the sources… verifying citations before answering
    </div>
  );
}
