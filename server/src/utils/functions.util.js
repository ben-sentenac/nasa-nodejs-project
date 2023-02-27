const _DEFAULT_PAGE_NUMBER_ = 1;
const _DEFAULT_LIMIT_OF_RECORDS_ = 0;

function paginate(query) {
    const limit = Math.abs(query.limit) || _DEFAULT_LIMIT_OF_RECORDS_;//if is set to 0 or not set mongo db return all documents
    const page = Math.abs(query.page) || _DEFAULT_PAGE_NUMBER_;
    //if page is 0 skip is 0,if page is 1 skip is limit, if page is 2 skip is limit * 2
    const skip = (page - 1) * limit;
    return {
        skip,
        limit
    };
}



module.exports = {
    paginate
};