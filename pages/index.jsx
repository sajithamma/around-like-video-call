export default function Index() {
    return (<>

        Redirecting...

    </>)
}

Index.getInitialProps = async (ctx, res) => {

    //Generate a random room id and create URL

    const room_id = Math.floor(Math.random(1000, 99999999) * 100000000);
    ctx.res.writeHead(302, { Location: '/' + room_id });
    ctx.res.end();
    return { value: null }



}