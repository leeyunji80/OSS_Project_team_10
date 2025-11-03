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




// 유클리드 호제법을 사용하여 최대공약수(GCD)를 계산하는 함수
int calculateGCD(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// 최소공배수(LCM)를 계산하는 함수
int calculateLCM(int a, int b, int gcd) {
    return (a * b) / gcd;
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

// 공약수와 그에 따른 몫의 쌍을 출력하는 함수
void findFactorPairs(int num1, int num2, int gcd) {
    printf("(1, %d, %d)", num1, num2);

    for (int i = 2; i <= gcd; i++) {
        if (gcd % i == 0 && num1 % i == 0 && num2 % i == 0) {
            printf(": (%d, %d, %d)", i, num1 / i, num2 / i);
        }
    }
    printf("\n");
}

int main() {
    int num1, num2;

    printf("두 정수 입력>> ");
    scanf("%d %d", &num1, &num2);

    // 두 숫자가 모두 0인 경우 처리
    if (num1 == 0 && num2 == 0) {
        return 0;
    }

    // 소수 찾아서 출력
    findPrimes(num1, num2);

    // GCD와 LCM 계산
    int gcd = calculateGCD(num1, num2);
    int lcm = calculateLCM(num1, num2, gcd);

    // 약수 쌍 출력
    findFactorPairs(num1, num2, gcd);

    // GCD와 LCM 출력
    printf("GCD=%d    LCM=%d\n", gcd, lcm);

    return 0;
} 