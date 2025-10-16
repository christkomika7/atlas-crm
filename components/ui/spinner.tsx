type spinnerProps = {
  size?: number;
};

export default function Spinner({ size = 20 }: spinnerProps) {
  return (
    <div
      className="border-[3px] border-secondary border-t-primary rounded-full animate-spin"
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
