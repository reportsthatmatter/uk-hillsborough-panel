import { readPanelHtml } from "./panel-html.ts";
import {
  cleanEdition,
  layoutPageJoins,
  pipeline,
  pageBreakContinuations,
  runningFurniture,
  quoteInset,
  numberedParagraphs,
  listedHeadings,
  numberedHeadings,
  allCapsHeadings,
  footnoteNumbers,
  layoutMarkers,
} from "@rtm/ingest";

/**
 * How this report is built. Owned by the report: every decision that shaped
 * its text is named here, and the passes it composes are library code, so a
 * fix to a shared pass reaches every report that calls it.
 */
export default pipeline({
  id: "uk-hillsborough-panel",
  title: "The Report of the Hillsborough Independent Panel",
  authors: "Hillsborough Independent Panel (the Rt Revd James Jones, Chair)",
  published_at: "12 September 2012",
  source_url: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/229038/0581.pdf",
  repo: ".",
  volumes: [
    {
      path: "archive/hillsborough-panel-report.pdf",
      sha256: "8dbea5f6fa8c565f4c69c9390637d8903b236dc85e1fc63bbc54ae0248b90d8e",
    },
  ],
  // Numbered "1.1", "1.2" paragraphs (reportsthatmatter-hzf). Chapter and
  // part headings are set by colour and size only, with no textual
  // convention pdftotext preserves — they were being stripped outright as
  // running-header furniture, since the same title recurs verbatim as the
  // header on every later page of that chapter. numbersTrackPages keeps
  // that stripped only where the furniture's own number tracks the page (a
  // real running header), recovering the one true occurrence — the chapter
  // opening itself — as a heading (reportsthatmatter-r19).
  passes: [
    // The text and structure come from the Panel's own website edition of the
    // report (reference/raw/, the site as the Wayback Machine kept it; see
    // panel-html.ts for what its markup means). The archive lacks some of its
    // pages (most of chapters 4, 7, 8 and 9): the adapter marks each such gap,
    // and the PDF's own text, as the passes below read it, fills it, every
    // filled block keeping its PDF page (reportsthatmatter-ivg.3). The PDF is
    // still read by every pass below, as the shadow ingest: its page markers
    // say which page carries which printed number, each block is stamped with
    // the page its first word aligns to, and every stretch where the website
    // and the PDF disagree is listed in fidelity.md.
    cleanEdition({
      dir: import.meta.dirname,
      encoding: "latin1",
      // The PDF prints each page's notes at its foot; the shadow lifts them out
      // (footnoteNumbers, below), and the edition's notes are aligned to those.
      notes: "page-foot",
      files: [
        { path: "reference/raw/foreword-page-1.html", sha256: "d79350ecb46bcb581385adc952a4cfcb082cdb1c8c871fe2fc3e79f37242c244" },
        { path: "reference/raw/summary-page-1.html", sha256: "5c67d21030742d52f938667ac47a374a300ab8e70f65bea0d4713b58b993893f" },
        { path: "reference/raw/summary-page-2.html", sha256: "0ca164b5c2008dccb3b0157289a8cda14be85b4c0ad130438d0e15489e9bba47" },
        { path: "reference/raw/summary-page-3.html", sha256: "35bc078b20950f6134808a064dca0ece75dbf3a82234207956421ed48a294a26" },
        { path: "reference/raw/summary-page-4.html", sha256: "55abe9e720184a24758681c7828a8113a7a1c26fe3856dc1d3f8190a5f8f7eca" },
        { path: "reference/raw/summary-page-5.html", sha256: "54d012ba435481aa17567a23edda577f0fa323ead425e5f1bd5367a019eb9b3f" },
        { path: "reference/raw/summary-page-6.html", sha256: "a7cb838b877f40ceddbd15ab1a8d084bb84d831b0777d364b9eaca7199f521a3" },
        { path: "reference/raw/summary-page-7.html", sha256: "46650252f19e5abb615c3ad4f94c66f04f56df5962c2ee267b017aec24e6ca72" },
        { path: "reference/raw/summary-page-8.html", sha256: "d1833841b2643a4c37ff8394088e9c06ff42ecb18ddd80819be87b1ad80a9a71" },
        { path: "reference/raw/summary-page-9.html", sha256: "a014214e5892cb7fdd7affd69d01c8b988b21b5d4abbff471c1c81552e60087d" },
        { path: "reference/raw/summary-page-10.html", sha256: "0c926ae2e750065840514a3c209831ab5af90a010f5b7080701b147a5095b8a9" },
        { path: "reference/raw/summary-page-11.html", sha256: "e8325d37a0cfe987b76df489a15138830e2e07ad4d95018954b65ebb299368ac" },
        { path: "reference/raw/summary-page-12.html", sha256: "855e114ec3a531a1e5c25149d9b4eb35e217ee4ed4d5a82bae82cccd46299359" },
        { path: "reference/raw/summary-page-13.html", sha256: "95ea98d730bb1f8819746b9bf423288698db246b0b94bc143d46bc46773ce1ca" },
        { path: "reference/raw/summary-page-14.html", sha256: "fc3544fa4ad8c756e606056d50ae6f57e3b5e3659c074f730450f442f09ff3b9" },
        { path: "reference/raw/part-1-page-1.html", sha256: "c42097156f0211d85d7222715d2043ff3acafe1b030fe4c94cc2c524753cb59c" },
        { path: "reference/raw/part-1-page-2.html", sha256: "2ed17e02cc257ec5b98c14ffa9b9596418e271e3273fcbdd8b7ce67643b5f7d2" },
        { path: "reference/raw/part-1-page-3.html", sha256: "00c4e3959f13b5088aa976777a5c2190676d340f6bee09019045c4cfb5c7c412" },
        { path: "reference/raw/part-1-page-4.html", sha256: "3f66d42d0ed6fec8a6a6efbad67b1bc981e3418b1a31790e6ca9decf11f38eee" },
        { path: "reference/raw/part-1-page-5.html", sha256: "568c403c8cc24242e669cf6e07f96f53314e43872b9e74b620b6391c9a22862a" },
        { path: "reference/raw/part-1-page-6.html", sha256: "9012b2b93fe392dc636e6f4d9a8f48baaaae79fd60731e13b9f0e705efaa52d9" },
        { path: "reference/raw/part-1-page-7.html", sha256: "a89295e7910e4102b1abeda5262f83fe520254a058865015f206d61853e4919c" },
        { path: "reference/raw/part-1-page-8.html", sha256: "1e5ddba632893cd92d859116de5d06dcac5ae87538af6d7049eb194584322e68" },
        { path: "reference/raw/part-1-page-9.html", sha256: "d1bfe9359a0f886bb42dbeeaf0fabba4180e52cd6b1fa3acf10fa1dd4ef3e9a5" },
        { path: "reference/raw/part-1-page-10.html", sha256: "0c42869966c687b0b7971c51dfbcc1f7f5d657ad9472fd3a31f2900770fdd236" },
        { path: "reference/raw/part-1-page-11.html", sha256: "9b3e9f466198c7e643251ec69b103d37d31589e2cd269aab62e755eb09c3c4c8" },
        { path: "reference/raw/part-1-page-12.html", sha256: "3e926c6ae1294fdb783f21aa91c4708f2e689499d98081298498ebb39db4d81a" },
        { path: "reference/raw/part-1-page-13.html", sha256: "32b92951548a37e45c3ff273e5d02c3bfa0d40f152729b953e33cf564fb51db1" },
        { path: "reference/raw/part-2-page-1.html", sha256: "3b86e2d9e0b0a90406f522f66489dee2008280dcbfaed78c7ff42a2d35ee8877" },
        { path: "reference/raw/ch1-page-1.html", sha256: "692a5045e6fdf60cad8002f0a383f1c6c749d38c6a27237b804090c4ddd28f64" },
        { path: "reference/raw/ch1-page-2.html", sha256: "c19c1ba95dedc10c84fed6cdccc69c20173655bb0cd461887b4f581c0af03e6d" },
        { path: "reference/raw/ch1-page-3.html", sha256: "d12fa920b4e065780c6c4b4b7f844bb26cb6db3dd769f597544574a5e514c356" },
        { path: "reference/raw/ch1-page-4.html", sha256: "c95bdca3d04b8a81676bfdb6168fb56d36880e4e3ef57a77673b8fefca68ce24" },
        { path: "reference/raw/ch1-page-5.html", sha256: "886a60e3b9872e7136a1ae448ecabfbcdea9e79756cc10f170fb940c849ef7ef" },
        { path: "reference/raw/ch1-page-6.html", sha256: "24533c4c4f100ff1a488aefff725abcf8a260fc41dceacf9b4612d838eb19455" },
        { path: "reference/raw/ch1-page-7.html", sha256: "c01e4d0a8f79b14c18a5f8a71a889b698fef7bba184ff433d3a89b95759b57e7" },
        { path: "reference/raw/ch1-page-8.html", sha256: "486367831320787ba98d4b9bc5b6c24f1f76c6eb5e7d94db89a0beda174f1478" },
        { path: "reference/raw/ch1-page-9.html", sha256: "4bd7681748150304e42c20d1a661c73f1cadd21c68a055e51f364e7efd0bab42" },
        { path: "reference/raw/ch1-page-10.html", sha256: "3e6c8b94515ed75985bbb96e2110b55853b53439985aeae39de601c0be0106f2" },
        { path: "reference/raw/ch1-page-11.html", sha256: "af750cddef589ef52f559fb478513b4db968b76085b4aeb2348cb4db4d939176" },
        { path: "reference/raw/ch2-page-1.html", sha256: "e739fb647ff66d30d4a028a04312bcb05a89e1597f7d3a860681ac83c7462e91" },
        { path: "reference/raw/ch2-page-2.html", sha256: "553a47ef9f3f4be3891aabc541ee325301fccb5cd4eb7252be7930c48847738d" },
        { path: "reference/raw/ch2-page-3.html", sha256: "ba20e56d2d6e484c3794bfd4ae0016808d5b108e74f25f1a78e040ae105ddb06" },
        { path: "reference/raw/ch2-page-4.html", sha256: "86ef0ee38f21da24b843dc4840c02e0cd89a276653d846713ac96f5d4e21f913" },
        { path: "reference/raw/ch2-page-5.html", sha256: "c9fbb2818b3bd7863db56a3f03bfd87da9c4590482eed648a89d7ca1193dfdad" },
        { path: "reference/raw/ch2-page-6.html", sha256: "7309253c4d864c5e2ddfcda9ef2a056176d8b499bffb1e04beb7fd8a618911fb" },
        { path: "reference/raw/ch2-page-7.html", sha256: "ab608c691ae85408114e425f4b8ba7b4052c3d4557e26f11426e1a95474c511f" },
        { path: "reference/raw/ch2-page-8.html", sha256: "fc2cbbbd54757c052e915c91a16fc247475cf9f8f915b0c8d8fbdcbfc01c4ed6" },
        { path: "reference/raw/ch3-page-1.html", sha256: "be81bcdacf81a1d0b9b2944e978df8390179214c263fc28475a51713f4b56ac6" },
        { path: "reference/raw/ch3-page-2.html", sha256: "dc543a22822739a50689e4c88668ce23b009e31f887e9b87698fcf360a8f80a5" },
        { path: "reference/raw/ch3-page-3.html", sha256: "7c0e4d36bfcec90400371f1fd7764980da5056d8380035a1e537a5ac62e3cba4" },
        { path: "reference/raw/ch3-page-4.html", sha256: "d8c474c6c9c930dcdc3309c3dadcbc1340a50a00b7cfb0cedc8fd6a3db595670" },
        { path: "reference/raw/ch3-page-5.html", sha256: "97ff708dd8fe24cc999d774d79e08e818721e69e8da19b90c025387800997a7d" },
        { path: "reference/raw/ch3-page-6.html", sha256: "c295be2b44af7e897b1b3c6b2de6325943d1b532c30580dc8b24c5464efefde1" },
        { path: "reference/raw/ch3-page-7.html", sha256: "0281fec7c1823f7e921e6a1146b270cb59d8f932dcf7155925924f3ca451932c" },
        { path: "reference/raw/ch3-page-8.html", sha256: "d631e1b6dcccc6da22854ff18f637753814597c46c219afac83a32a8ba2d27eb" },
        { path: "reference/raw/ch3-page-9.html", sha256: "ff261db51dcd8d2936de7123bd114bcf40c355631be3c1162e76525eabba6139" },
        { path: "reference/raw/ch3-page-10.html", sha256: "9aa2fae93f0f049c3244ab58704906f66209412da17545a70211c150d81feb17" },
        { path: "reference/raw/ch3-page-11a.html", sha256: "9ee6fe6a91a7d7de02cc3aa7a582d38fc18329ca8ce67f608ee543a2a4a972e4" },
        { path: "reference/raw/ch4-page-1.html", sha256: "783e2d1014add8694f8997c73853e5752eb8ce17ea9d035b04dad3271ab26bbe" },
        { path: "reference/raw/ch4-page-2.html", sha256: "28b72948c711e13aaa33792b510ed336afffa1b66d64c97c6490954607c72b3d" },
        { path: "reference/raw/ch4-page-12.html", sha256: "40d8945dae279312db61eced8cc5093e054b6efbadc7bec0407e164d56edcfea" },
        { path: "reference/raw/ch4-page-13.html", sha256: "d65578fc3d6853e17164d99f3926336c9c8246ecf0c1d2b770b2a4babb18e4ee" },
        { path: "reference/raw/ch5-page-1.html", sha256: "a4d840a04c7babf3b3cb4f7de33199cdb8f2c8e020bafcf1199513e6520da7a3" },
        { path: "reference/raw/ch5-page-2.html", sha256: "535e7c5b0287b80cb4085082dddbd75d1ddf3bb3e2b71601baf86476deadd6e9" },
        { path: "reference/raw/ch5-page-3.html", sha256: "24f16b631f00e3e599771b0a7d3317e1347a5fb2280b072c31a7c5bec67554cc" },
        { path: "reference/raw/ch5-page-4.html", sha256: "542db63fb14559d8f996d8b1bc86373f9e01e2ad14d1db81ce2a44e252d12dd3" },
        { path: "reference/raw/ch5-page-5.html", sha256: "dcbfa8696a84fb624d3fc5f83bc82fd9410ecd24625ae363387538b4f296f166" },
        { path: "reference/raw/ch5-page-6.html", sha256: "5eacae427c382d82ff4cbfe5aeda6ac33a368e100403db9a56c9b19ba19b97f2" },
        { path: "reference/raw/ch5-page-7.html", sha256: "78fcba6db48936684b1bfe7ba823ec0e2a1c156a60ae79885acd03e66a64a253" },
        { path: "reference/raw/ch5-page-8.html", sha256: "f5290d0a5c96f019a835f4cd9f5c4e25d44e66de6a6144814abfcaf5510e5d0c" },
        { path: "reference/raw/ch5-page-9.html", sha256: "e6e99573a09084135b8cc7aab108a69b0f8f88a10811ff4a79c77250b8297e7c" },
        { path: "reference/raw/ch5-page-10.html", sha256: "dc9cf055d1929cf8925165b5555be25ca5a0ff4c6d38c89b2de52fd668500a45" },
        { path: "reference/raw/ch5-page-11.html", sha256: "edfbe0bcf8a4ee4d21874ea63d3d52eaa60adbb5c64123e63fe3840bd0815535" },
        { path: "reference/raw/ch5-page-12.html", sha256: "6890f259b801ef41eaf733c30dc54566ad9a5ffb9fd74b3fcb8ebdcc7c5db907" },
        { path: "reference/raw/ch5-page-13.html", sha256: "aecc074ddaecc9aa52120b3bbca32d1b63891b63888495aa2cf2a0ccb35a2de9" },
        { path: "reference/raw/ch6-page-1.html", sha256: "46064a9fead1243fd0310e190e1e70272b2bcc8d500f9f9b5703abefb69abb08" },
        { path: "reference/raw/ch6-page-2.html", sha256: "06ed8a078fe1e1c6e3fc40261596a96d45fcb14f3d8611a961ba482faa9814a1" },
        { path: "reference/raw/ch6-page-3.html", sha256: "e0038555b7cf7c85101cda1786d8e695b8faa091eb25a86b036813cfc7928e44" },
        { path: "reference/raw/ch6-page-4.html", sha256: "f463020166b4d7d679c56abf7712ebe930104dce6796c512e441f95bc008093f" },
        { path: "reference/raw/ch6-page-5.html", sha256: "cbeadbce5ce9a894a9460713e9914caa00598b8c93cf14a0afe9e9d7e7abcf0b" },
        { path: "reference/raw/ch6-page-6.html", sha256: "fc6611b9d64354c76be098401782880421d54549effcf51a7d6f4d9fcfbe3b9b" },
        { path: "reference/raw/ch6-page-7.html", sha256: "f06036fb57ea89dc068110b4bee442475a6a389781b0f12739029336914fbb85" },
        { path: "reference/raw/ch6-page-8.html", sha256: "1195ac8734812fdfbae08cdcf7b5f0b0c8c6050795489e0bfb98d400d7a5e16a" },
        { path: "reference/raw/ch6-page-9.html", sha256: "cfb5d124dfafa7f38081e4feffd585fdffb39e86f1b5723b7c11078fc6e4d477" },
        { path: "reference/raw/ch6-page-10.html", sha256: "1e68bc66a178bbfa423cd2451e4d38379aeb2a515d387739fd525d488abeb37c" },
        { path: "reference/raw/ch6-page-11.html", sha256: "b5f3fef32c04ce5cd8aa72fa555216ae5d3834ad4b91acda3f709853e361ed52" },
        { path: "reference/raw/ch6-page-12.html", sha256: "494b6980444b3ced72f06cb243278ec61962eee12e37497cf1511e272c49b34d" },
        { path: "reference/raw/ch6-page-13.html", sha256: "297830d53ce496e64b7d85219e6ebfb86903aa1f716361c51c5e7182b9e21101" },
        { path: "reference/raw/ch6-page-14.html", sha256: "169162549d0ba9b84ea7936f1d0eabe6327e5a8fd4610e20ab101bf001882873" },
        { path: "reference/raw/ch6-page-15.html", sha256: "5321f9399506d60b8809373dd830328f83214b08375e10f07a06dffc06ccb322" },
        { path: "reference/raw/ch6-page-16.html", sha256: "7e0a2e9b85d2518533655438b730d4a0734dd42cf3ad3172ad03e53b703fe578" },
        { path: "reference/raw/ch7-page-1.html", sha256: "361bf8c5f9e68abaf036ddc5dc1b2752dfef27de86e20a0ba5fe9e77c584884d" },
        { path: "reference/raw/ch7-page-15.html", sha256: "c9b2af3d2b83a05310e480c5ad4194ece0fd61c46bb88b7cf376898b07fc1cca" },
        { path: "reference/raw/ch8-page-1.html", sha256: "d36d9d357ca051083aadc406844b4358a26a41e0a191e52b79a1e5a6cc6c559a" },
        { path: "reference/raw/ch8-page-2.html", sha256: "62a946e3fac00cad26fb05e1405a2ec04deb9c030a48cf29cb662060a004e72b" },
        { path: "reference/raw/ch8-page-3.html", sha256: "c05adb1b67159b125162c4aff95e4512dedb1aefa88165f32150c34d01add0f1" },
        { path: "reference/raw/ch8-page-4.html", sha256: "b4fa91ad1026209c88ec0b79961e07694eafbf6aa274a0befc73b6985c169343" },
        { path: "reference/raw/ch8-page-5.html", sha256: "90e36bd7bbd872b28ea57a89fa7c4d558785ff1ba521532b848c075741e164e4" },
        { path: "reference/raw/ch8-page-6.html", sha256: "f4d04b05cb4a0abb50ff5ac1a502364dfeed6e678673668cf55f269758412d8b" },
        { path: "reference/raw/ch9-page-1.html", sha256: "97cb86b59020c4b65fd17ecbd71a3a5c358771fe2262823161b3cd8879eed80a" },
        { path: "reference/raw/ch9-page-11.html", sha256: "2a23565c98f6c70b738cc9aaf931a2a4279038dbdf6a27271996c8cb55659416" },
        { path: "reference/raw/ch10-page-1.html", sha256: "5878631bf0a1f04274274b42ebf08043eb1b5b61f3af648df69bb86470acd4a9" },
        { path: "reference/raw/ch10-page-2.html", sha256: "667000bbc45373d32b15076a3f61fdef35b409136693a36bfc0b9140f92b737c" },
        { path: "reference/raw/ch10-page-3.html", sha256: "d806418f053e773ca6bc122dbf8f682834f0a894102194af36d651658e530c8d" },
        { path: "reference/raw/ch10-page-4.html", sha256: "dbf347e3ed484022fb9e60ccef5a438b94c021fd10125edade1c488302eec96f" },
        { path: "reference/raw/ch10-page-5.html", sha256: "6794ac1c6cff4f4af013744c89d50c94f1e32e43bb7f56833aec7901a4085266" },
        { path: "reference/raw/ch10-page-6.html", sha256: "6ea85ca9fee58be4c696fddf050a3cf8655c3fef2ca0f93d76de796257f9c8d2" },
        { path: "reference/raw/ch10-page-11.html", sha256: "d830e6d553424baf785df932633765c59d12758e7d66140f954532e3b957ecf7" },
        { path: "reference/raw/ch10-page-12a.html", sha256: "9517fa0a5b0e7133c00365c675828fb40ba96ee9e47f9a61c60548cf90351534" },
        { path: "reference/raw/ch11-page-1.html", sha256: "284740c9af3fabbef07a988ebce0e25884c3f1e77d761f710763721c33bc0716" },
        { path: "reference/raw/ch11-page-2.html", sha256: "b54d46413d46967f7afda3d2d9271be7cba48289cab9554c52990eb21071ac6e" },
        { path: "reference/raw/ch11-page-3.html", sha256: "62e52c51c81ab20663de506ce82f30a617b623e60ddf0c736beca94997acf8f9" },
        { path: "reference/raw/ch11-page-4.html", sha256: "79c1389ae8ca7672ff2df0bcad45cd81d540a0c9c66cae3945e47f0e0a89063c" },
        { path: "reference/raw/ch11-page-5.html", sha256: "f4e5898a393316a0daa6a0d67596b23303bbf07de9418c9e4a0d5b5281963c13" },
        { path: "reference/raw/ch11-page-6.html", sha256: "5dd45cf606a0ace84f682e6565a2d6452d5116dc5f15eb017d2f3c2dacb837e4" },
        { path: "reference/raw/ch11-page-7.html", sha256: "e7aa830461348f336dd57ff438c2a00c43b0c7732f7a33481406dcacc560241e" },
        { path: "reference/raw/ch11-page-8.html", sha256: "2941324d2a34d832ebf1b6e8102b934ca66216d888370e247215b3a1f68a7721" },
        { path: "reference/raw/ch11-page-9.html", sha256: "8ec44cad1b41896dde30c5084875c3a9bd09f5e1be9e7a9bc70a65e1b522ed7c" },
        { path: "reference/raw/ch11-page-10.html", sha256: "dbab40fcccb36c8adfb6a4a1d035aaca450d6a9e7dd6c907eabbbfd17b55044f" },
        { path: "reference/raw/ch12-page-1.html", sha256: "891d6df6f5e37baac1eae139ec6767b2066363f2fab50e4661c8f9927621bedd" },
        { path: "reference/raw/ch12-page-2.html", sha256: "65db372c02325f7a7ee1def4c13e0639bc8ce88b6baf7de2d2fa191d2e0a9a90" },
        { path: "reference/raw/ch12-page-3.html", sha256: "e25897a3de1b5723dfb558cd75cf38185c2c5a0af5bf39cb379e704ea028184c" },
        { path: "reference/raw/ch12-page-4.html", sha256: "8eedb24c98f10ba4f1e25d8024f86336885a16b0dbb5d3364a4fd859ec82ac1a" },
        { path: "reference/raw/ch12-page-5.html", sha256: "4124320af1b3db961b73acc8f6d21d4e15d3a1c79b7ba30f98144e0f674e5e00" },
        { path: "reference/raw/ch12-page-6.html", sha256: "bd2d97525012cab01c401b0f5608b827ed1a62fae43e87ea83764add635cfd54" },
        { path: "reference/raw/ch12-page-7.html", sha256: "a53320e5ba1c16222949d9d0a922f7e3cf7466f0d8f9b3cf51f52f3f41bcf2c6" },
        { path: "reference/raw/ch12-page-9.html", sha256: "4f50f277eb88e4216054d050eec8a1197bcc821213bc7745d93391e30e8ef53e" },
        { path: "reference/raw/ch12-page-10a.html", sha256: "4cfcccd1241a86209e0dd623215e892773fa6f6c4dd4b5d46f0969273176e9ec" },
        { path: "reference/raw/part-3-page-1.html", sha256: "ad8b61e139aa1fd52fd5697d1757d066d850c0d7e3ca98934efe75b6f552c1f1" },
        { path: "reference/raw/part-3-page-2.html", sha256: "06191ff2dd1f25df70599296a01e4d4e2ecab9662564c14a1367e985c233305b" },
        { path: "reference/raw/part-3-page-5.html", sha256: "0c35ce9aeeaf962aeca42058b3d27fad4fcf01c07912dcdda8397cab0c62c056" },
        { path: "reference/raw/part-4-page-1.html", sha256: "acc50fb1b2e2d75357575c88156a2501361fe5e4b922749a60f6cb4219d63eb0" },
        { path: "reference/raw/appendix-1-page-1.html", sha256: "2b6b7c390c7c60ddcab1eccb2de0253eb956375ba21d5381ed0e09553d384a65" },
        { path: "reference/raw/appendix-1-page-2.html", sha256: "04357cb56d4d4d7043cdd71c13b51f8771313c3c458ff153c331bf4b3b6fe0c8" },
        { path: "reference/raw/appendix-2-page-1.html", sha256: "f8287a630a63b143da1bdddd6165b940985d26fef2192190ac301d0cf6321cb5" },
        { path: "reference/raw/appendix-3-page-1.html", sha256: "554adc9adc5467a0c7cb8e86b5ecdc6ac0d9326707c47a1f2c2a2963004ddbf7" },
        { path: "reference/raw/appendix-3-page-2.html", sha256: "68aae3a3d74d1f5a3561862d2902d93e2f86432b0efbf44a58124603d8402fb5" },
        { path: "reference/raw/appendix-4-page-1.html", sha256: "0c53bd9f393f205b120b2ba3d79c25e48c342af59cf538e227708938bc53209e" },
        { path: "reference/raw/appendix-5-page-1.html", sha256: "ba9d32882b5b6a0f10eede19c5a8b031a9764ce52792e9421b69d8959f2b8e1b" },
      ],
      read: (files) => readPanelHtml(files),
    }),
    // A paragraph run over a page break that opens on a capital, a digit or a
    // quotation mark (or follows a full stop on a justified page) joins when the
    // layout says it runs on: no first-line indent, same face (reportsthatmatter-38s.10).
    layoutPageJoins(),
    // Page-foot notes are numbered "104. Letter from…", with a full stop: read
    // as the bare "104 Letter" style, none was found and all 1,069 were printed
    // in the body, their markers bare (reportsthatmatter-ivg.3).
    footnoteNumbers("period"),
    // The markers are raised digits ("delay.104"); notes restart in every
    // chapter, so only the layout can say which digits are markers.
    layoutMarkers(),
    runningFurniture({ numbersTrackPages: true }),
    quoteInset(10),
    numberedParagraphs(),
    // The report quotes press cuttings ("SHAME OF BOOZY YOBS") and legal
    // memorials with their own numbered paragraphs ("18. TO HER MAJESTY'S
    // ATTORNEY GENERAL...") that read as headings on their own. The
    // structure is Parts, Chapters and Appendices, never a numbered or
    // all-caps line, so only a heading the contents lists is kept.
    numberedHeadings(false),
    allCapsHeadings(false),
    listedHeadings(),
    // A paragraph that stops mid-sentence at a page foot and resumes in lower
    // case on the next page was read as a block quotation (4 cases).
    pageBreakContinuations(),
  ],
});
