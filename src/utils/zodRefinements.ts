import dayjs from "@/libs/dayjs";

type StringRefinement = [(check: string) => boolean, { message: string }];

export const isSameOrAfterDate = (
  afterDate: dayjs.Dayjs,
  errorMessage: string,
): StringRefinement => {
  return [
    (datestring: string) => {
      const date = dayjs(datestring);
      return date.isValid() && date.isSameOrAfter(afterDate, "day");
    },
    { message: errorMessage },
  ];
};
