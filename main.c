#inlcude <stdio.h>
//각 함수는 자유롭게 변경 가능합니다
int FindGcd(int n1, int n2){
  int temp;
  while(n2!=0){
    temp=n2;
    n2=n1%n2;
    n1=temp;
  }
return n1;

int main(){
int n1,n2;

while(1){
printf("Enter two integers >>");
scanf("%d %d", &n1, &n2);

if(n1==0 && n2==0)
  break;

printf("GCD=%d \n\n", gcd(n1,n2));
}
return 0;

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
