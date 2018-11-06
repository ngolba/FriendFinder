//////////// Survey  

let responses = '';
let currentQuestion = 0;
let questions = ["i get a healthy amount of sleep at night.", "i look forward to what the future may hold.",
    "everything is going to turn out alright.", "i look forward to each approaching day.",
    "sometimes I feel completely alone.", "this is really all there is.", "this is all there will ever be.",
    "life is a series of futile advances.", "nobody will miss me when i'm gone.",
    "at least this is all going to be over eventually."
]
let surveyDone = false;

$(document).ready(() => {
    $('#nameFace').fadeIn(500)
})

$('#nameFace').submit((e) => {
    if (!surveyDone) {
        $('.surveyFirstForm').fadeOut()
        $('#questionGrid').delay(500).fadeIn()
        e.preventDefault()
    } else {
        let iframe = document.getElementById("uploadFrame");
        iframe.onload = () => {
            let elmnt = iframe.contentWindow.document.getElementById("surveyMatchWinner");
            let match = JSON.parse($(elmnt).text());
            $('#matchImg').attr('src', match.url);
            $('#matchName').text(match.name);
            $('#results').fadeIn()
        };
    }
})

$('#userUpload').change((e) => {
    $('#fileName').text(($(e.currentTarget).val().split('\\').pop()))
    $('#uploadIcon').removeClass('fa-cloud-upload-alt').addClass('fa-file-image')
})

$('#surveySubmit').click((e) => {
    responses += $("input[type=radio]:checked").attr("points")
    currentQuestion++;
    $('progress').attr('value', currentQuestion)
    $('input[type=radio]').each(function () {
        $(this).attr("name", currentQuestion)
    })
    if (currentQuestion >= 10) {
        $('#questionGrid').fadeOut();
        surveyDone = true;
        $('#responses').attr('value', responses)
    } else {
        e.preventDefault();
        $('#question').fadeOut();
        setTimeout(() => {
            $('#question').text(questions[currentQuestion]).fadeIn()
        }, 400)
    }

})