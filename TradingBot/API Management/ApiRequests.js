/* Rest Standards
Response:
{
    "code": <code>,
    "msg": <msg>,
    "data": <data>
}
*/

const Url = 'http://'+ip+'/api/login';
const Data = {
    username: un,
    password: pw
};

$.ajax({
    method: "POST",
    url: Url,
    timeout: 400,
    data: Data,

    success: function(res) {
        console.log(res.msg);
    },
    error: function(error) {
    }
})