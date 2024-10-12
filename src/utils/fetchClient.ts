export const fetchClient = async <T>({
  url,
  method = "GET",
  headers = {},
  payload,
}: {
  url: string;
  method: ApiMethod;
  headers?: {
    [key: string]: string;
  };
  payload?: any;
}): Promise<T> => {
  const res = await fetch(url, {
    body: payload ? payload : undefined,
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    },
    method,
  });

  let resobj: null | unknown = null;
  try {
    resobj = await res.json();
  } catch (e: Error | unknown) {
    console.log("Error: ", e);
    throw new Error("Unexpected issue. Please try again.");
  }
  return resobj as T;
};

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";
