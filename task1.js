function sostavChisla(massivChisel, chislo) {
  let result = [];

  function findCombinations(arr, index, sum, current) {
    if (sum === chislo) {
      result.push(current);
      return;
    }

    if (index === arr.length || sum > chislo) {
      return;
    }

    findCombinations(arr, index + 1, sum, current);
    findCombinations(arr, index + 1, sum + arr[index], current.concat(arr[index]));
  }

  findCombinations(massivChisel, 0, 0, []);
  return result;
}