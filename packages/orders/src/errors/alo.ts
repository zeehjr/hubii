import { Result, tryCatch } from './try';

class MeuNovoError extends Error {}

class BiggerThanFiveError extends Error { }

class BiggerThanTenError extends Error { }

function aloha(n: number): Result<string, BiggerThanTenError | BiggerThanFiveError | MeuNovoError>  {
  if (n > 10) {
    return Result.error(new BiggerThanTenError());
  }

  if (n > 5) {
    return Result.error(new BiggerThanFiveError());
  }

  if (n > 2) {
    return Result.error(new MeuNovoError());
  }

  return Result.ok('hehehe');
}

function another() {
  const result = aloha(5);

  if (result.error) {
    console.error(result.error);

    if (result.error instanceof BiggerThanTenError) {

    }

    return;
  }

  console.log(result.value);
}

async function fetchPosts(): Promise<string[]> {
  return [];
}

async function fetchPostsErrors(): Promise<Result<Error, string[]>> {

}

async function anotherAsync() {
  const posts = await tryCatch(fetchPosts());

  if (posts.error) {
    if ()
  }
}
