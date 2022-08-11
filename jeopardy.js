let categoryIds =[];

let categories = [];
        // categories is the main data structure for the app; it looks like this:

        //  [
        //    { title: "Math",
        //      clues: [
        //        {question: "2+2", answer: 4, showing: null},
        //        {question: "1+1", answer: 2, showing: null}
        //        ...
        //      ],
        //    },
        //    { title: "Literature",
        //      clues: [
        //        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
        //        {question: "Bell Jar Author", answer: "Plath", showing: null},
        //        ...
        //      ],
        //    },
        //    ...
        //  ]
let numOfCateg = 30;

//********Selected Elements*********//
const $startBtn = $('#startBtn');
const $gameTable = $('#game-table');



async function getCategoryIds(){
    /** Get NUM_CATEGORIES random category from API.
    *
    * Returns array of category ids
    */

    console.debug('getCategoryIds');
    const response = await axios.get(`http://jservice.io/api/categories?count=${numOfCateg}`);
    console.log(response.data);
    const categWithClue = response.data.filter(c => c.clues_count > 6);
    console.log("categWithClue", categWithClue);
    
    while(categoryIds.length < 6){
        let randomNum = Math.floor(Math.random()*categWithClue.length);
        console.debug("randomNum", randomNum);

        if(!(categoryIds.includes(categWithClue[randomNum].id))){
            categoryIds.push(categWithClue[randomNum].id);
        }
        
        }
    return categoryIds;
}



async function getCategory(catId) {
    /** Return object with data about a category:
     *
     *  Returns { title: "Math", clues: clue-array }
     *
     * Where clue-array is:
     *   [
     *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
     *      {question: "Bell Jar Author", answer: "Plath", showing: null},
     *      ...
     *   ]
     */
    const response = await axios.get(`http://jservice.io/api/category?id=${catId}`);
    const {clues}=response.data;
    const cluesArray = [];

    for(let clue of clues){
        const {question, answer} = clue;
        const obj = {question, answer, show:null};
        //some data provided by API has =
        // if(obj.question !== "=" || obj.answer !== "="){
        cluesArray.push(obj);
        // }
    }
    
    const fiveCluesArray =_.sampleSize(cluesArray, 5);
    // let NotValidClues = fiveCluesArray.some(x => x.question === '=');
    // if(NotValidClues){
    //     fiveCluesArray = [];
    //     fiveClueArray =_.sampleSize(cluesArray, 5);

    // }

    return {title: response.data.title, clues:fiveCluesArray};
    
}


async function fillTable() {
    /** Fill the HTML table#jeopardy with the categories & cells for questions.
     *
     * - The <thead> should be filled w/a <tr>, and a <td> for each category
     * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
     *   each with a question for each category in a <td>
     *   (initally, just show a "?" where the question/answer would go.)
     */
    const $wholeTable = $('<table></table>');

    const $tableHead = $(`
            <thead>
                    <tr>
                        <th id="0">${categories[0].title}</th>
                        <th id="1">${categories[1].title}</th>
                        <th id="2">${categories[2].title}</th>
                        <th id="3">${categories[3].title}</th>
                        <th id="4">${categories[4].title}</th>
                        <th id="5">${categories[5].title}</th>
                    </tr>
            </thead>`);

    const $tableBody = $('<tbody></tbody>');
    $wholeTable.append($tableHead);
    $wholeTable.append($tableBody);

    //c = row, also corresponds to clue array index
    for(let c = 0; c<5 ; c++){
        const $tr = $(`<tr id = ${c}></tr>`);
        //t = category title, also corresonds to index of category array
        for(let t =0; t <6 ; t++){
            const $tableData = $(`     
            <td id="${t}-${c}">
               <p class="questionMark">?</p>
               <p class="clue">${categories[t].clues[c].question}</p>
               <p class="answer">${categories[t].clues[c].answer}</p>                     
            </td>
            `);
        
            $tr.append($tableData);
        }
        
        $tableBody.append($tr);
    }

   $gameTable.append($wholeTable);
   $(".clue").hide();
   $('.answer').hide();
   

}



function handleClick(evt) {
    /** Handle clicking on a clue: show the question or answer.
     *
     * Uses .showing property on clue to determine what to show:
     * - if currently null, show question & set .showing to "question"
     * - if currently "question", show answer & set .showing to "answer"
     * - if currently "answer", ignore click
     * */
    const id=$(this).attr('id');
    const t = Number(id.split('')[0]);
    const c = Number(id.split('')[2]);
    // console.log($(this).children('.clue'));
    // console.log(categories[t].clues[c].show);

    if(!categories[t].clues[c].show){
        //if show property is null, show clue and change the show property to question
        $(this).children('.questionMark').hide();
        $(this).children('.clue').show();
        $(this).children('.answer').hide();
        $(this).css('background-color', 'green');
        categories[t].clues[c].show = 'question';
        // console.log($(this).children('.clue'));
    } else if (categories[t].clues[c].show === 'question'){
        //if show property is set to question, show answer
        $(this).children('.questionMark').hide();
        $(this).children('.clue').hide();
        $(this).children('.answer').show();
        $(this).css('background-color', 'yellow');
        $(this).css('color', 'black');
        categories[t].clues[c].show = 'answer';
    } else {
        return;
    }

}



function showLoadingView() {
    /** Wipe the current Jeopardy board, show the loading spinner,
     * and update the button used to fetch data.
     */
    $gameTable.hide();
    //stwch startBtn test to "loading"
    $startBtn.text("Loading...");

}



function hideLoadingView() {
    /** Remove the loading spinner and update the button used to fetch data. */
    $startBtn.text("Restart");

}



async function setupAndStart() {
    /** Start game:
     *
     * - get random category Ids
     * - get data for each category
     * - create HTML table
     * */
    categoryIds = [];
    categories =[]; //clear categories
    $gameTable.empty(); // clear the table to start fresh

     await getCategoryIds();
     for(let id of categoryIds){
        const obj = await getCategory(id);
        categories.push(obj);
     }
     
     showLoadingView()
     fillTable()
     hideLoadingView()
     $gameTable.show();

}

$startBtn.on('click', setupAndStart);
/** On click of start / restart button, set up game. */


// TODO

/** On page load, add event handler for clicking clues */
$('body').on('click', 'td', handleClick);
// TODO

/* <td id="1-0">
<p class="questionMark">?</p>
<p class="clue">${categories[1].clues[0].question}</p>
<p class="answer">${categories[1].clues[0].answer}</p> 
</td>
<td id="2-0">
<p class="questionMark">?</p>
<p class="clue">${categories[2].clues[0].question}</p>
<p class="answer">${categories[2].clues[0].answer}</p> 
</td>
<td id="3-0"><p class="questionMark">?</p></td>
<td id="4-0"><p class="questionMark">?</p></td>
<td id="5-0"><p class="questionMark">?</p></td>

</tr> */