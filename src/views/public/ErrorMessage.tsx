interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage(props: ErrorMessageProps) {
  return (
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
      <p class="text-sm font-medium">{props.message}</p>
    </div>
  );
}
