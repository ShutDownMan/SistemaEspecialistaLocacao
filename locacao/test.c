#include <stdio.h>

#define x ++y

int y = 2;

void M() { int y = 1; printf("%d ", x); }

void N() { printf("%d ", x); }

int main() {

  M();

  N();

  return 0;

}