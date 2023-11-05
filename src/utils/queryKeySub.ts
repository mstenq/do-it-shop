const subscribers = new Set<(changeKey: string, value: string) => void>();

const onChange = (watchKey: string, callback: (value: string) => void) => {
  const createSubscriber =
    (watchKey: string) => (changeKey: string, value: string) => {
      if (changeKey !== watchKey) {
        return;
      }
      callback(value);
    };

  const sub = createSubscriber(watchKey);
  subscribers.add(sub);

  return () => {
    subscribers.delete(sub);
  };
};

const dispatch = (changeKey: string, value: string) => {
  subscribers.forEach((sub) => {
    sub(changeKey, value);
  });
};

export const querySub = {
  onChange,
  dispatch,
};
