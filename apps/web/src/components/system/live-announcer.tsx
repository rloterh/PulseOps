export function LiveAnnouncer() {
  return (
    <>
      <div id="pulseops-live-polite" aria-live="polite" aria-atomic="true" className="sr-only" />
      <div
        id="pulseops-live-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}
