export function password(password) {
  if (password === "") return true;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  return passwordRegex.test(password);
}
export function email(email) {
  if (email === "") return true;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  return emailRegex.test(email);
}
export function name(name) {
  if (name === "") return true;

  const nameRegex = /^[A-Za-z'\s]+$/;

  return nameRegex.test(name);
}
export function age(age) {
  if (age === "") return true;

  const ageNum = Number(age);

  return Number.isInteger(ageNum) && ageNum >= 1 && ageNum <= 120;
}
export function phoneNumber(phoneNumber) {
  if (phoneNumber === "") return true;

  const phoneRegex = /^\d{11}$/; // Adjust the regex based on your phone number format

  return phoneRegex.test(phoneNumber);
}

