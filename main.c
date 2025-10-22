#inlcude <stdio.h>
//각 함수는 자유롭게 변경 가능합니다
int FindGcd(int n1, int n2){
  //서진님 파트
}

void PrintPrime(int n1){
  //현석님 파트
}

int Findlcm(int a, int b) {
    int k = a;
    int j = b;
    while (k != j) {
        if (k < j)k += a;
        if (k > j)j += b;
    }
    return k;
}

int main(){
  int num1, num2 = 0;

  printf("두 정수 입력>>");
  scanf("%d %d", &num1, &num2);

  if(num1 == 0 && num2 == 0){
    return 0;
  }

  findPrimes(num1, num2);

  int gcd = calculateGCD(num1, num2);
  int lcm = Findlcm(num1, num2, gcd);

  printf("GCD = %d  LCM = %d \n", gcd, lcm);

  return 0;
}
