#include <stdio.h>

// 숫자가 소수인지 확인하는 함수
int isPrime(int n) {
    if (n <= 1) return 0;
    if (n == 2) return 1;
    if (n % 2 == 0) return 0;

    for (int i = 3; i * i <= n; i += 2) {
        if (n % i == 0) return 0;
    }
    return 1;
} 

// 범위 내의 소수를 찾아서 출력하는 함수
void findPrimes(int num1, int num2) {
    int min = (num1 < num2) ? num1 : num2;

    printf("소수: ");
    int first = 1;
    for (int i = 2; i <= min; i++) {
        if (isPrime(i)) {
            if (!first) printf(" ");
            printf("%d", i);
            first = 0;
        }
    }
    printf("\n");
}