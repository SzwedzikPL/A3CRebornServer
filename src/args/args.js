
const args = function(){
  const args = process.argv.slice(2);

  return {
    debug: args.includes("-debug")
  };
}();

export default args;
