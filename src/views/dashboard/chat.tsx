type ChatPageProps = {
  userMessage?: string;
  assistantMessage?: string;
};

export function ChatPage(props: ChatPageProps) {
  const { userMessage, assistantMessage } = props;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Chat med Gozy</h1>

        {userMessage && assistantMessage && (
          <div className="mb-6 space-y-4">
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-lg py-3 px-4 max-w-2xl">
                <p className="text-sm font-medium mb-1">Du</p>
                <p>{userMessage}</p>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg py-3 px-4 max-w-2xl">
                <p className="text-sm font-medium mb-1 text-gray-700">Gozy</p>
                <p>{assistantMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <form method="post" action="/dashboard/chat">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Skriv din besked
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Hvordan kan jeg hjælpe dig i dag?"
                />
              </div>

              <div className="flex justify-between items-center">
                <a
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Tilbage til dashboard
                </a>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
