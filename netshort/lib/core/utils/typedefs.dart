import 'package:fpdart/fpdart.dart';

import '../errors/failures.dart';

/// Result of a domain operation: a [Failure] on the left, a value on the right.
typedef FailureOr<T> = Either<Failure, T>;

/// Asynchronous [FailureOr]; the return type of every repository method.
typedef FutureFailureOr<T> = Future<Either<Failure, T>>;
