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
  int n1 = 0, n2 = 0;
  int gcd = 0, lcm = 0;

  printf("Enter two integers>>");
  scanf("%d%d", &n1, &n2);

  if(n2 > n1){
    int tmp = n1;
    n1 = n2;
    n2 = tmp;
  }

  printf("\nPrime numbers>>");
  PrintPrime(n2);
  gcd = FindGcd(n1, n2);
  lcm = Findlcm(n1, n2);

  printf("\nGCD = %d, LCM = %d", gcd, lcm);

  return 0;
}
